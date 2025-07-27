// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Docker } = require("node-docker-api");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const { v4: uuidv4 } = require("uuid");

// - Add Supabase import -
const { createClient } = require("@supabase/supabase-js");
// -

const app = express();
// Ensure Docker socket is accessible
const docker = new Docker({ socketPath: "/var/run/docker.sock" });

// - Supabase Client Configuration (Add your credentials) -
// It's highly recommended to use environment variables for these.
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for backend access
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("FATAL: Supabase URL or Service Role Key not configured.");
  console.error(
    "Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.",
  );
  process.exit(1); // Exit if critical config is missing
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
// -

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Adjust if your frontend URL is different
    credentials: true,
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

app.use(express.json({ limit: "10mb" }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// --- Script Validation Function (Whitelist Approach) ---
// This is a basic example. You should expand this list significantly
// and potentially make it challenge-specific by fetching rules.
async function validateScriptForExecution(script, challengeId = null) {
  // Basic sanitization: Trim whitespace
  const trimmedScript = script.trim();

  // If script is empty, it's technically valid (though does nothing)
  if (!trimmedScript) {
    return { isValid: true, message: "Empty script" };
  }

  // Define allowed command patterns (very basic whitelist)
  // This should be much more sophisticated in a real application,
  // ideally fetched from a database per challenge.
  const allowedPatterns = [
    /^ls(\s+(-[a-zA-Z]+)*)?$/, // ls with optional flags like -l, -a, -la
    /^echo(\s+.+)?$/, // echo with optional arguments
    /^cat(\s+.+)?$/, // cat with optional file arguments
    /^pwd$/, // pwd
    /^whoami$/, // whoami
    // Add more safe commands and their typical flag combinations here
    // Example: /^date(\s+(-[a-zA-Z]+)*)?$/
  ];

  // Check against allowed patterns
  const isAllowed = allowedPatterns.some((pattern) =>
    pattern.test(trimmedScript),
  );

  if (!isAllowed) {
    // Check if it's a potentially dangerous command (basic check, supplement whitelist)
    const dangerousCommands = [
      "rm",
      "shutdown",
      "reboot",
      "kill",
      "chmod",
      "chown",
      "wget",
      "curl",
      "dd",
    ];
    const foundDangerous = dangerousCommands.find((cmd) =>
      trimmedScript.includes(cmd),
    );
    if (foundDangerous) {
      throw new Error(
        `Execution of command '${foundDangerous}' is not permitted.`,
      );
    }
    // If not explicitly allowed and not explicitly dangerous (based on simple check), reject
    throw new Error(
      "The submitted script contains commands or syntax that are not permitted. Please use only allowed commands like 'ls', 'echo', 'cat'.",
    );
  }

  // If we reach here, it passed the basic checks
  return { isValid: true, message: "Script passed basic validation." };
}
// --- End of Script Validation Function ---

// Script execution endpoint
app.post("/api/execute", async (req, res) => {
  const { script, timeout = 5000, challengeId } = req.body; // Default timeout 5 seconds
  const executionId = uuidv4();
  let container; // Declare container here for potential cleanup in catch/finally

  // Basic input validation
  if (!script || typeof script !== "string") {
    return res.status(400).json({
      error: "Invalid script provided",
      execution_id: executionId,
      success: false,
    });
  }

  // --- NEW: Validate script before execution attempt ---
  try {
    await validateScriptForExecution(script, challengeId);
    // If validation passes, execution continues below
  } catch (validationError) {
    // Handle validation errors
    console.error("Script validation failed:", validationError.message);
    return res.status(400).json({
      // 400 Bad Request
      error: "Invalid or disallowed command.",
      message:
        validationError.message ||
        "The submitted script contains disallowed elements.",
      execution_time: 0, // No execution time as it failed pre-validation
      execution_id: executionId,
      success: false,
    });
  }
  // --- END NEW VALIDATION ---

  const startTime = Date.now();

  try {
    // Security: Ensure script is properly escaped for shell inclusion
    // (This escaping is still important for the shell command itself, even with containerization)
    const escapedScript = script.replace(/"/g, '\\"');

    // Create container with security constraints (this is the primary defense now)
    container = await docker.container.create({
      Image: "alpine:latest",
      Cmd: [
        "sh",
        "-c",
        `timeout ${Math.floor(timeout / 1000)} sh -c "${escapedScript}"`, // Use timeout command inside container
      ],
      WorkingDir: "/tmp",
      User: "1000:1000", // Non-root user
      NetworkMode: "none", // No network access
      // Memory: 100 * 1024 * 1024, // 100MB limit (optional)
      // CpuPeriod: 100000,
      // CpuQuota: 50000, // 50% CPU limit (optional)
      HostConfig: {
        // Memory: 100 * 1024 * 1024, // 100MB limit
        // CpuPeriod: 100000,
        // CpuQuota: 50000, // 50% CPU limit
        AutoRemove: true, // Automatically remove container when it exits
      },
    });

    // Start the container
    await container.start();

    // Wait for the container to finish execution or timeout
    const finishedContainer = await container.wait();

    // Get the logs/output from the container
    const logs = await container.logs({
      stdout: true,
      stderr: true,
      follow: false,
      timestamps: false,
    });

    // Process logs: Convert buffer to string, handle null/undefined
    let output = "";
    if (logs && (Buffer.isBuffer(logs) || typeof logs === "string")) {
      output = logs.toString(); // This handles both Buffer and string cases
    } else {
      console.warn(
        "Container logs were not in expected format:",
        typeof logs,
        logs,
      );
      // output remains empty string
    }

    const executionTime = Date.now() - startTime;

    // Check container exit code
    const exitCode = finishedContainer?.statusCode ?? -1; // Default to -1 if undefined

    // Send successful response
    res.json({
      output: output,
      success: exitCode === 0, // Success if exit code is 0
      execution_time: executionTime,
      execution_id: executionId,
      exit_code: exitCode,
    });
  } catch (err) {
    // --- IMPROVED ERROR HANDLING ---
    console.error("Execution error:", err);
    const executionTime = Date.now() - startTime;

    // Attempt to kill and remove the container if it was created but error occurred
    if (container) {
      try {
        // Check if container exists before trying to kill
        const containerInfo = await container.status().catch(() => null);
        if (
          containerInfo &&
          containerInfo.data &&
          containerInfo.data.State &&
          containerInfo.data.State.Running
        ) {
          await container
            .stop()
            .catch((stopErr) =>
              console.error("Error stopping container:", stopErr),
            );
        }
        // Note: AutoRemove should handle deletion, but explicit remove can be tried if needed
        // await container.delete().catch(delErr => console.error("Error deleting container:", delErr));
      } catch (killErr) {
        console.error("Error cleaning up container:", killErr);
      }
    }
    // --- END IMPROVED ERROR HANDLING ---

    res.status(500).json({
      error: err.message || "Execution failed",
      execution_time: executionTime,
      execution_id: executionId,
      success: false,
    });
  }
  // Note: A 'finally' block is not strictly necessary here as cleanup is attempted in 'catch'
  // and AutoRemove handles the container deletion on successful completion.
});

// - Refactored validateChallengeOutput to use database-driven rules -
// (This function remains largely unchanged, included for completeness)
async function validateChallengeOutput(
  supabaseClient,
  challengeId,
  script,
  output,
  error,
) {
  const testResults = [];
  try {
    // 1. Fetch the challenge and its validation rules from the database
    const { data: challenge, error: fetchError } = await supabaseClient
      .from("challenges")
      .select("validation_rules")
      .eq("id", challengeId)
      .single();

    if (fetchError) throw fetchError;

    // 2. Get the validation rules array, defaulting to an empty array if not found
    const rules = challenge?.validation_rules || [];

    // 3. If no rules are defined, default to checking for execution success/errors
    if (rules.length === 0) {
      testResults.push({
        test_case: "Script executed successfully",
        passed: !error,
        expected: "No errors during execution",
        actual: error ? `Error: ${error}` : "Executed successfully",
      });
      return testResults; // Return early if no specific rules
    }

    // 4. Iterate through the rules and apply validation logic
    for (const [index, rule] of rules.entries()) {
      let passed = false;
      let message = "";
      let expected = rule.description || `Rule ${index + 1} passed`;
      let actual = "";

      try {
        switch (rule.type) {
          case "script_includes":
            // Check if the submitted script contains a specific substring
            passed = script.includes(rule.pattern);
            actual = passed
              ? `Found '${rule.pattern}' in script`
              : `Script does not contain '${rule.pattern}'`;
            break;
          case "script_includes_regex":
            // Check if the script matches a regular expression
            try {
              const regex = new RegExp(rule.pattern);
              passed = regex.test(script);
              actual = passed
                ? `Script matches pattern '${rule.pattern}'`
                : `Script does not match pattern '${rule.pattern}'`;
            } catch (e) {
              console.error(
                "Invalid regex in script validation rule:",
                rule.pattern,
                e,
              );
              actual = `Internal validation error: Invalid regex pattern`;
            }
            break;
          case "output_includes":
            // Check if the command output contains a specific substring
            passed = output.includes(rule.pattern);
            actual = passed
              ? `Found '${rule.pattern}' in output`
              : `Output does not contain '${rule.pattern}'`;
            break;
          case "output_includes_regex":
            // Check if the output matches a regular expression
            try {
              const regex = new RegExp(rule.pattern);
              passed = regex.test(output);
              actual = passed
                ? `Output matches pattern '${rule.pattern}'`
                : `Output does not match pattern '${rule.pattern}'`;
            } catch (e) {
              console.error(
                "Invalid regex in output validation rule:",
                rule.pattern,
                e,
              );
              actual = `Internal validation error: Invalid regex pattern`;
            }
            break;
          case "output_exact_match":
            // Check if the output exactly matches the expected value
            passed = output.trim() === rule.pattern.trim();
            actual = passed
              ? `Output matches expected value`
              : `Output does not match expected value`;
            expected = `Expected output: ${rule.pattern}`;
            break;
          case "no_errors":
            // Check that no errors occurred during execution
            passed = !error;
            actual = passed ? "No errors occurred" : `Error occurred: ${error}`;
            break;
          default:
            console.warn("Unknown validation rule type:", rule.type);
            actual = `Internal validation error: Unknown rule type '${rule.type}'`;
        }
      } catch (err) {
        console.error("Error applying validation rule:", rule, err);
        passed = false;
        actual = `Internal validation error: ${err.message}`;
      }

      testResults.push({
        test_case: rule.description || `Validation Rule ${index + 1}`,
        passed,
        expected,
        actual,
      });
    }
  } catch (err) {
    console.error("Error validating challenge output:", err);
    testResults.push({
      test_case: "Internal Validation Error",
      passed: false,
      expected: "Validation should complete successfully",
      actual: `Internal validation error: ${err.message}`,
    });
  }
  return testResults;
}
// - End of refactored validateChallengeOutput -

// Terminal session endpoint (for future WebSocket implementation)
app.post("/api/terminal/create", async (req, res) => {
  const sessionId = uuidv4();
  // In a real implementation, this would create a persistent container
  // and return connection details for WebSocket
  res.json({
    session_id: sessionId,
    websocket_url: `ws://localhost:3001/terminal/${sessionId}`,
    expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not found",
    message: "The requested endpoint does not exist",
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Shell execution server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔒 Security: Rate limiting enabled`);
});
