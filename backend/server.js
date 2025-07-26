// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Docker } = require("node-docker-api");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const { v4: uuidv4 } = require("uuid");
// --- Add Supabase import ---
const { createClient } = require("@supabase/supabase-js");
// --------------------------

const app = express();
const docker = new Docker({ socketPath: "/var/run/docker.sock" });

// --- Supabase Client Configuration (Add your credentials) ---
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
// -------------------------------------------------------------

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// Rate limiting
const executeLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: "Too many execution requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/execute", executeLimit);
app.use(express.json({ limit: "10mb" }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Shell script execution endpoint
app.post("/api/execute", async (req, res) => {
  const { script, challengeId, timeout = 10000 } = req.body;
  const executionId = uuidv4();

  if (!script || typeof script !== "string") {
    return res.status(400).json({
      error: "Invalid script provided",
      execution_id: executionId,
    });
  }

  // --- REMOVED: Unreliable dangerous command blacklist ---
  // const dangerousCommands = [ ... ]; // All items removed
  // const scriptLower = script.toLowerCase();
  // const foundDangerous = dangerousCommands.find(cmd => scriptLower.includes(cmd));
  // if (foundDangerous) {
  //   return res.status(400).json({
  //     error: `Dangerous command detected: ${foundDangerous}`,
  //     execution_id: executionId
  //   });
  // }
  // --- END REMOVED SECTION ---

  let container;
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
        `timeout ${Math.floor(timeout / 1000)} sh -c "${escapedScript}"`,
      ],
      WorkingDir: "/tmp",
      User: "1000:1000", // Non-root user
      NetworkMode: "none", // No network access
      Memory: 128 * 1024 * 1024, // 128MB memory limit
      CpuShares: 512, // Limited CPU
      AttachStdout: true,
      AttachStderr: true,
      Tty: false,
      OpenStdin: false,
      StdinOnce: false,
      Env: [
        "HOME=/tmp",
        "USER=shellcraft",
        "SHELL=/bin/sh",
        "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
      ],
      HostConfig: {
        AutoRemove: true,
        ReadonlyRootfs: true, // Read-only filesystem (except Tmpfs)
        NoNewPrivileges: true,
        CapDrop: ["ALL"], // Drop all capabilities
        SecurityOpt: ["no-new-privileges:true"], // Prevent privilege escalation
        Tmpfs: {
          // Allow writing only to limited temporary filesystems
          "/tmp": "rw,noexec,nosuid,size=10m",
          "/var/tmp": "rw,noexec,nosuid,size=10m",
        },
        Ulimits: [
          // Limit resources further
          { Name: "nproc", Soft: 10, Hard: 10 }, // Max 10 processes
          { Name: "fsize", Soft: 1024 * 1024, Hard: 1024 * 1024 }, // 1MB file size limit
        ],
      },
    });

    // Start container
    await container.start();

    // Set up timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error("Execution timeout"));
      }, timeout);
    });

    // Get container logs
    const stream = await container.logs({
      stdout: true,
      stderr: true,
      follow: true,
    });

    let output = "";
    let error = "";

    const logPromise = new Promise((resolve) => {
      stream.on("data", (chunk) => {
        const data = chunk.toString();
        if (chunk[0] === 1) {
          // stdout
          output += data.slice(8); // Remove Docker stream header
        } else if (chunk[0] === 2) {
          // stderr
          error += data.slice(8); // Remove Docker stream header
        }
      });

      stream.on("end", () => {
        resolve({ output, error });
      });
    });

    // Wait for container to finish or timeout
    const result = await Promise.race([logPromise, timeoutPromise]);

    // Wait for container to exit
    await container.wait();

    const executionTime = Date.now() - startTime;
    const success = !error && container.data?.State?.ExitCode === 0;

    // Data-driven test case validation for known challenges
    let testResults = [];
    if (challengeId) {
      testResults = await validateChallengeOutput(
        supabase,
        challengeId,
        script,
        output,
        error,
      );
    }

    res.json({
      output: output || "No output",
      error: error || null,
      success,
      execution_time: executionTime,
      execution_id: executionId,
      test_results: testResults,
    });
  } catch (err) {
    console.error("Execution error:", err);

    // Clean up container if it exists
    if (container) {
      try {
        await container.kill();
      } catch (killErr) {
        console.error("Error killing container:", killErr);
      }
    }

    const executionTime = Date.now() - startTime;

    res.status(500).json({
      error: err.message || "Execution failed",
      execution_time: executionTime,
      execution_id: executionId,
      success: false,
    });
  }
});

// --- Refactored validateChallengeOutput to use database-driven rules ---
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
      .single(); // Challenge should exist if challengeId is valid

    if (fetchError) {
      console.error(
        "Error fetching challenge for validation:",
        challengeId,
        fetchError,
      );
      // Gracefully handle fetch error, maybe return a generic failure result
      return [
        {
          test_case: "Validation Setup",
          passed: false,
          expected: "Challenge data loaded",
          actual: `Error loading challenge data: ${fetchError.message}`,
        },
      ];
    }

    // 2. Get the validation rules array (defaults to empty array if null/undefined)
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
              passed = false;
              actual = `Invalid validation regex: ${rule.pattern}`;
            }
            break;

          case "output_includes":
            // Check if the command output contains a specific substring
            passed = (output || "").includes(rule.pattern);
            actual = passed
              ? `Found '${rule.pattern}' in output`
              : `Output does not contain '${rule.pattern}'`;
            break;

          case "output_matches_regex":
            // Check if the output matches a regular expression
            try {
              const outputRegex = new RegExp(rule.pattern);
              passed = outputRegex.test(output || "");
              actual = passed
                ? `Output matches pattern '${rule.pattern}'`
                : `Output does not match pattern '${rule.pattern}'`;
            } catch (e) {
              console.error(
                "Invalid regex in output validation rule:",
                rule.pattern,
                e,
              );
              passed = false;
              actual = `Invalid validation regex: ${rule.pattern}`;
            }
            break;

          case "no_error":
            // Explicitly check that no error occurred
            passed = !error;
            actual = passed
              ? "No execution errors"
              : `Execution error: ${error}`;
            break;

          // --- Add more rule types here as needed ---
          // case 'custom_script_validation':
          //   // Run a custom validation script against output/script
          //   // Requires significant security considerations
          //   break;

          default:
            console.warn(
              "Unknown validation rule type encountered:",
              rule.type,
            );
            passed = false;
            expected = `Unknown rule type: ${rule.type}`;
            actual = "Rule type not implemented";
        }
      } catch (validationError) {
        console.error("Error applying validation rule:", rule, validationError);
        passed = false;
        actual = `Validation error: ${validationError.message}`;
      }

      testResults.push({
        test_case: rule.description || `Rule ${index + 1}`, // Use description or generic name
        passed,
        expected,
        actual,
      });
    }
  } catch (err) {
    console.error("Unexpected error in validateChallengeOutput:", err);
    testResults.push({
      test_case: "Validation System",
      passed: false,
      expected: "Validation to complete successfully",
      actual: `Internal validation error: ${err.message}`,
    });
  }

  return testResults;
}
// --- End of refactored validateChallengeOutput ---

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
  console.log(`🐳 Docker: Container isolation active`);
});

module.exports = app;
