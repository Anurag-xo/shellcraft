-- Insert sample challenges with structured validation rules
INSERT INTO challenges (id, title, description, instructions, difficulty, category, points, examples, validation_rules) VALUES
('basic-ls', 'File Listing Basics', 'Learn to use the ls command with various options to list and examine files in different formats.', 'Your task is to use the `ls` command to:
1. List all files in the current directory including hidden files
2. Show detailed information including permissions, owner, size, and modification date
3. Sort the output by modification time (newest first)

**Hint:** You''ll need to combine multiple `ls` options to achieve this.', 'Beginner', 'File Operations', 25,
'[{"input": "ls -lat", "output": "total 24\ndrwxr-xr-x 3 user user 4096 Jan 15 10:30 .\ndrwxr-xr-x 5 root root 4096 Jan 14 09:15 ..\n-rw-r--r-- 1 user user  220 Jan 14 09:15 .bashrc\n-rw-r--r-- 1 user user 1024 Jan 15 10:25 backup.sh\ndrwxr-xr-x 2 user user 4096 Jan 15 10:30 scripts", "explanation": "This shows all files (-a) in long format (-l) sorted by time (-t)"}]'::jsonb,
'[
  {
    "type": "script_includes",
    "pattern": "-l",
    "description": "Checks if the -l flag is used for long format listing"
  },
  {
    "type": "script_includes",
    "pattern": "-a",
    "description": "Checks if the -a flag is used to show hidden files"
  },
  {
    "type": "script_includes",
    "pattern": "-t",
    "description": "Checks if the -t flag is used to sort by modification time"
  }
]'::jsonb
),
('file-permissions', 'File Permissions Management', 'Master chmod, chown, and understanding Unix file permissions system.', 'Your task is to manage file permissions:
1. Change file permissions using chmod with octal notation
2. Make a script executable for the owner only
3. Set read and write permissions for group members

**Example:** `chmod 755 script.sh` gives full permissions to owner, read+execute to group and others.', 'Intermediate', 'Security', 50,
'[{"input": "chmod 755 script.sh", "output": "Permissions changed successfully", "explanation": "Sets rwxr-xr-x permissions (755 in octal)"}]'::jsonb,
'[
  {
    "type": "script_includes",
    "pattern": "chmod",
    "description": "Checks if the chmod command is used to change permissions"
  }
  -- Add more rules for chown, specific octal checks if needed
]'::jsonb
),
('text-processing', 'Text Processing with Grep', 'Use grep, sed, and awk to process and manipulate text files efficiently.', 'Your task is to process text files:
1. Search for specific patterns in files using grep
2. Extract specific columns from structured data
3. Count occurrences of patterns

**Example:** `grep -n "error" logfile.txt` shows line numbers with matches.', 'Intermediate', 'Text Processing', 40,
'[{"input": "grep -n \"error\" logfile.txt", "output": "15:Error: Connection failed\n23:Error: Invalid input", "explanation": "Shows line numbers (-n) where pattern matches"}]'::jsonb,
'[
  {
    "type": "script_includes",
    "pattern": "grep",
    "description": "Checks if the grep command is used for pattern searching"
  }
]'::jsonb
),
('shell-variables', 'Shell Variables and Environment', 'Understand environment variables, shell variables, and parameter expansion.', 'Your task is to work with variables:
1. Create and use shell variables
2. Access environment variables
3. Use parameter expansion techniques

**Example:** `name="John"; echo "Hello, $name"` creates and uses a variable.', 'Beginner', 'Basics', 30,
'[{"input": "name=\"John\"; echo \"Hello, $name\"", "output": "Hello, John", "explanation": "Creates a variable and uses it in echo command"}]'::jsonb,
'[
  {
    "type": "script_includes",
    "pattern": "=",
    "description": "Checks if variable assignment syntax (=) is used"
  },
  {
    "type": "script_includes",
    "pattern": "$",
    "description": "Checks if variable expansion syntax ($) is used"
  }
]'::jsonb
),
('loops-conditionals', 'Loops and Conditionals', 'Master for loops, while loops, if statements, and conditional logic in shell scripts.', 'Your task is to use control structures:
1. Write a for loop to iterate over files
2. Use if statements for conditional execution
3. Implement while loops for repetitive tasks

**Example:** `for file in *.txt; do echo $file; done` loops through text files.', 'Intermediate', 'Control Flow', 60,
'[{"input": "for file in *.txt; do echo \"Processing $file\"; done", "output": "Processing file1.txt\nProcessing file2.txt", "explanation": "Loops through all .txt files and processes each one"}]'::jsonb,
'[
  {
    "type": "script_includes_regex",
    "pattern": "\\b(for|while)\\b",
    "description": "Checks if a loop construct (for/while) is used"
  },
  {
    "type": "script_includes_regex",
    "pattern": "\\b(if|case)\\b",
    "description": "Checks if a conditional construct (if/case) is used"
  }
]'::jsonb
),
('process-management', 'Process Management', 'Handle processes using ps, kill, jobs, and background operations effectively.', 'Your task is to manage processes:
1. List running processes with ps
2. Find specific processes by name
3. Understand process states and signals

**Example:** `ps aux | grep nginx` finds nginx processes.', 'Advanced', 'System Admin', 75,
'[{"input": "ps aux | grep nginx", "output": "user 1234 0.0 0.1 nginx: worker process", "explanation": "Shows nginx processes with detailed information"}]'::jsonb,
'[
  {
    "type": "script_includes",
    "pattern": "ps",
    "description": "Checks if the ps command is used to list processes"
  }
]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET -- Upsert to handle re-running migrations
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  instructions = EXCLUDED.instructions,
  difficulty = EXCLUDED.difficulty,
  category = EXCLUDED.category,
  points = EXCLUDED.points,
  examples = EXCLUDED.examples,
  validation_rules = EXCLUDED.validation_rules,
  updated_at = now();
