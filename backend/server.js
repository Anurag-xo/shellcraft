const express = require('express');
const cors = require('cors');
const { Docker } = require('node-docker-api');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { v4: uuidv4 } = require('uuid');

const app = express();
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const executeLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: 'Too many execution requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/execute', executeLimit);
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Shell script execution endpoint
app.post('/api/execute', async (req, res) => {
  const { script, challengeId, timeout = 10000 } = req.body;
  const executionId = uuidv4();

  if (!script || typeof script !== 'string') {
    return res.status(400).json({
      error: 'Invalid script provided',
      execution_id: executionId
    });
  }

  // Security: Basic script validation
  const dangerousCommands = [
    'rm -rf /',
    'dd if=',
    'mkfs',
    'fdisk',
    'format',
    'del /f',
    'shutdown',
    'reboot',
    'halt',
    'poweroff',
    'init 0',
    'init 6',
    'kill -9 1',
    'killall',
    'pkill',
    'curl',
    'wget',
    'nc ',
    'netcat',
    'telnet',
    'ssh',
    'scp',
    'rsync',
    'mount',
    'umount',
    'chroot',
    'sudo',
    'su ',
    'passwd',
    'useradd',
    'userdel',
    'usermod',
    'groupadd',
    'groupdel',
    'crontab',
    'at ',
    'batch',
    'nohup &',
    'disown',
    '&& rm',
    '; rm',
    '| rm',
    'eval',
    'exec',
    '$()',
    '`',
    'python',
    'node',
    'ruby',
    'perl',
    'php',
    'java',
    'gcc',
    'make',
    'cmake'
  ];

  const scriptLower = script.toLowerCase();
  const foundDangerous = dangerousCommands.find(cmd => scriptLower.includes(cmd));
  
  if (foundDangerous) {
    return res.status(400).json({
      error: `Dangerous command detected: ${foundDangerous}`,
      execution_id: executionId
    });
  }

  let container;
  const startTime = Date.now();

  try {
    // Create container with security constraints
    container = await docker.container.create({
      Image: 'alpine:latest',
      Cmd: ['sh', '-c', `timeout ${Math.floor(timeout / 1000)} sh -c "${script.replace(/"/g, '\\"')}"`],
      WorkingDir: '/tmp',
      User: '1000:1000', // Non-root user
      NetworkMode: 'none', // No network access
      Memory: 128 * 1024 * 1024, // 128MB memory limit
      CpuShares: 512, // Limited CPU
      AttachStdout: true,
      AttachStderr: true,
      Tty: false,
      OpenStdin: false,
      StdinOnce: false,
      Env: [
        'HOME=/tmp',
        'USER=shellcraft',
        'SHELL=/bin/sh',
        'PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin'
      ],
      HostConfig: {
        AutoRemove: true,
        ReadonlyRootfs: true,
        NoNewPrivileges: true,
        CapDrop: ['ALL'],
        SecurityOpt: ['no-new-privileges:true'],
        Tmpfs: {
          '/tmp': 'rw,noexec,nosuid,size=10m',
          '/var/tmp': 'rw,noexec,nosuid,size=10m'
        },
        Ulimits: [
          { Name: 'nproc', Soft: 10, Hard: 10 },
          { Name: 'fsize', Soft: 1024 * 1024, Hard: 1024 * 1024 } // 1MB file size limit
        ]
      }
    });

    // Start container
    await container.start();

    // Set up timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Execution timeout'));
      }, timeout);
    });

    // Get container logs
    const stream = await container.logs({
      stdout: true,
      stderr: true,
      follow: true
    });

    let output = '';
    let error = '';

    const logPromise = new Promise((resolve) => {
      stream.on('data', (chunk) => {
        const data = chunk.toString();
        if (chunk[0] === 1) { // stdout
          output += data.slice(8); // Remove Docker stream header
        } else if (chunk[0] === 2) { // stderr
          error += data.slice(8); // Remove Docker stream header
        }
      });

      stream.on('end', () => {
        resolve({ output, error });
      });
    });

    // Wait for container to finish or timeout
    const result = await Promise.race([logPromise, timeoutPromise]);
    
    // Wait for container to exit
    await container.wait();

    const executionTime = Date.now() - startTime;
    const success = !error && container.data?.State?.ExitCode === 0;

    // Basic test case validation for known challenges
    let testResults = [];
    if (challengeId) {
      testResults = validateChallengeOutput(challengeId, script, output, error);
    }

    res.json({
      output: output || 'No output',
      error: error || null,
      success,
      execution_time: executionTime,
      execution_id: executionId,
      test_results: testResults
    });

  } catch (err) {
    console.error('Execution error:', err);
    
    // Clean up container if it exists
    if (container) {
      try {
        await container.kill();
      } catch (killErr) {
        console.error('Error killing container:', killErr);
      }
    }

    const executionTime = Date.now() - startTime;
    
    res.status(500).json({
      error: err.message || 'Execution failed',
      execution_time: executionTime,
      execution_id: executionId,
      success: false
    });
  }
});

// Validate challenge-specific outputs
function validateChallengeOutput(challengeId, script, output, error) {
  const testResults = [];

  switch (challengeId) {
    case 'basic-ls':
      testResults.push({
        test_case: 'Files are listed in long format',
        passed: script.includes('-l'),
        expected: 'Command should include -l flag',
        actual: script.includes('-l') ? 'Found -l flag' : 'Missing -l flag'
      });
      
      testResults.push({
        test_case: 'Hidden files are shown',
        passed: script.includes('-a'),
        expected: 'Command should include -a flag',
        actual: script.includes('-a') ? 'Found -a flag' : 'Missing -a flag'
      });
      
      testResults.push({
        test_case: 'Output sorted by modification time',
        passed: script.includes('-t'),
        expected: 'Command should include -t flag',
        actual: script.includes('-t') ? 'Found -t flag' : 'Missing -t flag'
      });
      break;

    case 'file-permissions':
      testResults.push({
        test_case: 'Uses chmod command',
        passed: script.includes('chmod'),
        expected: 'Command should use chmod',
        actual: script.includes('chmod') ? 'Found chmod command' : 'Missing chmod command'
      });
      break;

    default:
      testResults.push({
        test_case: 'Script executed successfully',
        passed: !error,
        expected: 'No errors during execution',
        actual: error ? `Error: ${error}` : 'Executed successfully'
      });
  }

  return testResults;
}

// Terminal session endpoint (for future WebSocket implementation)
app.post('/api/terminal/create', async (req, res) => {
  const sessionId = uuidv4();
  
  // In a real implementation, this would create a persistent container
  // and return connection details for WebSocket
  
  res.json({
    session_id: sessionId,
    websocket_url: `ws://localhost:3001/terminal/${sessionId}`,
    expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'The requested endpoint does not exist'
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