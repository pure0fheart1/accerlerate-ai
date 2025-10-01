# Comprehensive Guide to Claude Code

**Your AI-Powered Coding Assistant for Modern Web Development**

---

## Table of Contents

1. [Introduction](#1-introduction)
   - [What is Claude Code?](#what-is-claude-code)
   - [Key Features](#key-features)
   - [Use Cases in Web App Development](#use-cases-in-web-app-development)
2. [Installation and Setup](#2-installation-and-setup)
   - [Prerequisites](#prerequisites)
   - [Step-by-Step Installation](#step-by-step-installation)
   - [IDE Integration](#ide-integration)
3. [Basic Usage](#3-basic-usage)
   - [Core Commands](#core-commands)
   - [Practical Examples](#practical-examples)
   - [Common Workflows](#common-workflows)
4. [Best Practices](#4-best-practices)
   - [Prompt Engineering](#prompt-engineering)
   - [Workflow Optimization](#workflow-optimization)
   - [Common Pitfalls to Avoid](#common-pitfalls-to-avoid)
5. [Advanced Features](#5-advanced-features)
   - [MCP Servers and Browser Automation](#mcp-servers-and-browser-automation)
   - [Git Integration](#git-integration)
   - [Custom Tools and Extensions](#custom-tools-and-extensions)
   - [Agentic Workflows](#agentic-workflows)
6. [Integration with Modern Tech Stacks](#6-integration-with-modern-tech-stacks)
   - [React and Vite Projects](#react-and-vite-projects)
   - [Supabase Integration](#supabase-integration)
   - [AI Service Integration](#ai-service-integration)
7. [Troubleshooting and Tips](#7-troubleshooting-and-tips)
8. [Resources and Further Learning](#8-resources-and-further-learning)

---

## 1. Introduction

### What is Claude Code?

Claude Code is Anthropic's innovative command-line interface (CLI) tool designed to supercharge your coding workflow. Unlike general chat-based AI assistants, Claude Code is built specifically for **agentic coding**—meaning it can autonomously plan, execute tasks, and iterate with minimal input from developers.

This low-level, unopinionated CLI tool provides direct access to Anthropic's advanced AI models (Claude Sonnet 4 and Opus 4.1) and is engineered for real-world software development. It can read your codebase, edit files, run tests, use Git, and even interact with browsers or servers.

> **Important Note**: Claude Code is not a replacement for your IDE—it's a collaborative coding partner. As of 2025, no AI performs at a senior engineer level; developers still need to be hands-on and review all AI-generated code.

### Key Features

| Feature | Description |
|---------|-------------|
| **Agentic Autonomy** | Plans and executes multi-step tasks independently (e.g., "build a full React component with error handling") |
| **Codebase Awareness** | Automatically scans your repository for context without manual copy-pasting |
| **Tool Integration** | Runs shell commands, browsers (via Playwright), or custom scripts |
| **Multi-Instance Support** | Run parallel sessions for different parts of your application |
| **Safety Focus** | Low-level design prevents over-automation risks, with opt-in advanced modes |
| **Model Selection** | Choose between Sonnet 4 (speed) and Opus 4.1 (complex reasoning) |

### Use Cases in Web App Development

Claude Code excels at common development tasks:

- **Code Generation**: Create boilerplate React components, API integrations, and database schemas
- **Debugging**: Analyze and fix errors in Vite/Tailwind/TypeScript setups
- **Refactoring**: Optimize performance, improve code quality, and modernize legacy code
- **Documentation**: Generate inline comments, README files, and API documentation
- **Testing**: Write unit tests, integration tests, and end-to-end test suites
- **Database Management**: Design schemas, write migrations, and optimize queries

---

## 2. Installation and Setup

### Prerequisites

Before installing Claude Code, ensure you have:

- **Node.js** v18+ (recommended for modern web applications)
- **Anthropic API Key** (sign up at [anthropic.com](https://anthropic.com) and generate one)
- **Git** for version control
- **Optional**: VS Code or Cursor IDE for enhanced integration

### Step-by-Step Installation

#### 1. Install Claude Code

Choose your preferred installation method:

```bash
# Via npm (cross-platform)
npm install -g claude-code

# Via Homebrew (macOS)
brew install anthropic/tap/claude-code
```

#### 2. Configure API Key

Set your Anthropic API key as an environment variable:

```bash
# For Linux/macOS (add to ~/.bashrc or ~/.zshrc)
export ANTHROPIC_API_KEY=your-api-key-here

# For Windows (PowerShell)
$env:ANTHROPIC_API_KEY="your-api-key-here"

# Or use a .env file in your project root
echo "ANTHROPIC_API_KEY=your-api-key-here" > .env
```

#### 3. Verify Installation

```bash
claude-code --version
```

You should see the installed version number displayed.

### IDE Integration

#### VS Code Extension

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "Claude Code"
4. Click Install
5. Launch Claude Code sessions directly from your editor

#### Initial Project Setup

Navigate to your project root and initialize Claude Code:

```bash
cd /path/to/your/project
claude-code init
```

This creates a configuration file that Claude Code will reference for project-specific settings.

> **Security Tip**: The `--dangerously-skip-permissions` flag enables "YOLO mode" where Claude can run commands without asking. Use sparingly and only in trusted environments—it can execute destructive operations if not careful.

---

## 3. Basic Usage

### Core Commands

Claude Code operates through terminal commands with the following syntax:

```bash
claude-code [command] [options] [target]
```

#### Essential Commands

**Generate Code**
```bash
claude-code generate --function "createReactComponent" --lang typescript
```
Creates new functions, classes, or complete files.

**Refactor Existing Code**
```bash
claude-code refactor src/components/Sidebar.tsx --optimize
```
Improves code quality, performance, and maintainability.

**Review and Debug**
```bash
claude-code review --file src/services/geminiService.ts --focus security
```
Analyzes code for bugs, security issues, or best practice violations.

**Create New Files**
```bash
claude-code create --type component --name ProfileEditor --framework react
```
Generates structured files following your framework conventions.

**Modify Existing Files**
```bash
claude-code modify src/pages/Dashboard.tsx --add "usage tracking integration"
```
Updates files with specific functionality.

**Batch Operations**
```bash
claude-code batch --pattern "*.tsx" --task "add TypeScript types"
```
Performs the same operation across multiple files.

**Run Tests**
```bash
claude-code test --generate --file src/utils/helpers.ts
```
Creates and executes test suites automatically.

### Practical Examples

#### Example 1: Adding a New Feature

Suppose you're building a web app and need to add a new AI analyzer tool:

```bash
claude-code create \
  --type tool \
  --name AIUsageAnalyzer \
  --description "Analyzes AI usage patterns and generates insights" \
  --framework react \
  --integrate gemini
```

Claude Code will:
1. Generate the React component with proper TypeScript types
2. Create necessary hooks and utility functions
3. Integrate with your existing Gemini service
4. Add navigation entry in your sidebar
5. Suggest unit tests

#### Example 2: Debugging Build Errors

When you encounter a cryptic error:

```bash
claude-code debug "Vite build error: Module not found '@/components/Sidebar'" \
  --file vite.config.ts
```

Claude analyzes your config, identifies the issue (likely path alias misconfiguration), and suggests fixes.

#### Example 3: Refactoring for Performance

```bash
claude-code refactor src/services/geminiService.ts \
  --optimize \
  --focus "API call efficiency and error handling"
```

### Common Workflows

#### Workflow 1: Feature Development

```bash
# 1. Plan the feature
claude-code plan "Add user profile editing with avatar upload"

# 2. Generate components
claude-code create --type component --name ProfileEditor

# 3. Integrate with backend
claude-code modify src/services/api.ts --add "profile update endpoints"

# 4. Write tests
claude-code test --generate --component ProfileEditor

# 5. Review changes
claude-code review --changes-only
```

#### Workflow 2: Bug Investigation

```bash
# 1. Describe the bug
claude-code debug "Image generator fails on landscape images" --verbose

# 2. Analyze relevant files
claude-code review src/pages/ImageGenerator.tsx --focus "error handling"

# 3. Apply fix
claude-code modify src/pages/ImageGenerator.tsx --fix "aspect ratio validation"

# 4. Test the fix
claude-code test --file src/pages/ImageGenerator.tsx --run
```

---

## 4. Best Practices

### Prompt Engineering

The quality of Claude Code's output depends heavily on how you communicate with it.

#### Be Specific and Contextual

**Bad Prompt:**
```bash
claude-code create --type component --name Button
```

**Good Prompt:**
```bash
claude-code create --type component --name PrimaryButton \
  --description "Reusable button with loading state, icon support, and variants (primary, secondary, danger)" \
  --framework react \
  --styling tailwind \
  --typescript strict
```

#### Trigger Advanced Thinking Modes

Claude Code has different reasoning levels that you can activate:

- **`think`**: 4,000 tokens of reasoning (default for most tasks)
- **`think hard`**: 8,000 tokens (complex logic)
- **`think harder`**: 16,000 tokens (architectural decisions)
- **`ultrathink`**: 32,000 tokens (maximum reasoning capacity)

Example:
```bash
claude-code refactor src/services/geminiService.ts \
  --optimize \
  --prompt "ultrathink about the best way to handle API rate limiting, error retry logic, and response caching"
```

#### Use CLAUDE.md Configuration Files

Create a `CLAUDE.md` file in your project root to establish consistent rules:

```markdown
# Project Guidelines for Claude Code

## Tech Stack
- React 19.1.1
- TypeScript (strict mode)
- Tailwind CSS for styling
- Supabase for backend
- Vite for build tooling

## Code Conventions
- Use functional components with hooks
- Prefer named exports over default exports
- Always include TypeScript types (no `any`)
- Follow Tailwind utility-first approach
- Use async/await over promises
- Implement proper error boundaries

## File Structure
- Components in `src/components/`
- Pages in `src/pages/`
- Services in `src/services/`
- Types in `src/types/`
- Utils in `src/utils/`

## Testing
- Write unit tests for all utilities
- Include integration tests for API calls
- Use Vitest as test runner
```

Claude Code will automatically reference this file for context.

#### Iterate in Small Steps

Break large tasks into manageable chunks:

```bash
# Step 1: Plan
claude-code plan "Build authentication system with email/password and OAuth"

# Step 2: Generate types
claude-code create --type types --name auth --description "User, Session, AuthProvider types"

# Step 3: Create service layer
claude-code create --type service --name authService

# Step 4: Build UI components
claude-code create --type component --name LoginForm
claude-code create --type component --name SignupForm

# Step 5: Integrate and test
claude-code integrate --feature auth --test
```

Use `/clear` to reset context and save tokens between unrelated tasks.

### Workflow Optimization

#### Measure Your Productivity

Track metrics to quantify Claude Code's impact:

- **Pull Request Size**: Aim for smaller, more focused PRs
- **Test Coverage**: Monitor percentage before/after AI assistance
- **Time Saved**: Track hours spent on boilerplate vs. core logic
- **Code Quality**: Use linters to measure complexity reduction

Studies show developers achieve **10-30% productivity gains** with disciplined AI-assisted workflows.

#### Run Parallel Sessions

For complex applications, run multiple Claude instances:

```bash
# Terminal 1: Frontend development
cd /path/to/project
claude-code --session frontend

# Terminal 2: Backend/API work
cd /path/to/project
claude-code --session backend

# Terminal 3: Testing and quality assurance
cd /path/to/project
claude-code --session testing
```

#### Implement Security and Quality Gates

Always review AI-generated code:

1. **PR Size Limits**: Keep changes under 500 lines per PR
2. **Mandatory Tests**: Require tests for all new features
3. **Code Review**: Human review before merging
4. **Quick Check Shortcuts**: Use `qcheck` commands
   - `qcheckf`: Function-level checks
   - `qcheckc`: Component-level checks
   - `qchecks`: Security-focused review

#### Control Costs

Monitor token usage to manage API costs:

- Clear chat context frequently with `/clear`
- Use Sonnet for routine tasks (faster, cheaper)
- Reserve Opus for complex architectural decisions
- Avoid including entire large files—target specific sections

#### Team Collaboration

Synchronize configurations across your team:

```bash
claude-code team --sync-config
```

This ensures everyone follows the same conventions and leverages shared prompts.

### Common Pitfalls to Avoid

#### 1. Over-Reliance on AI

**Problem**: Accepting all suggestions without review leads to technical debt.

**Solution**: Always test extensively. Claude excels at suggestions but can hallucinate APIs, libraries, or patterns that don't exist in your specific context.

#### 2. Large Context Windows

**Problem**: Feeding too much code at once causes token limit errors and degraded performance.

**Solution**: Keep sessions focused. Target specific files or functions rather than entire directories.

#### 3. Ignoring AI Feedback

**Problem**: Claude might suggest an approach that won't work with your specific setup (e.g., Supabase RLS policies).

**Solution**: Push back and iterate: "This approach won't work with Supabase Row Level Security—suggest an alternative that respects RLS policies."

#### 4. Skipping Documentation

**Problem**: AI-generated code without comments becomes unmaintainable.

**Solution**: Always request inline documentation:
```bash
claude-code create --type component --name DataTable --include-docs --explain-complex
```

#### 5. Not Version Controlling Prompts

**Problem**: Losing track of what worked well.

**Solution**: Save successful prompts in a `prompts/` directory or team wiki for reuse.

---

## 5. Advanced Features

### MCP Servers and Browser Automation

Claude Code integrates with **Model Context Protocol (MCP) servers** for advanced UI testing and development.

#### Browser Automation with Playwright

```bash
claude-code mcp --browser playwright
```

This opens a browser instance that Claude can control to:
- Take screenshots for visual debugging
- Test responsive designs
- Verify UI interactions
- Automate user flows

**Example Use Case**: Testing your app's responsive sidebar

```bash
claude-code mcp --browser playwright \
  --task "Test sidebar collapse behavior on mobile, tablet, and desktop viewports. Take screenshots at each breakpoint."
```

Claude will navigate your app, resize the viewport, and capture evidence of responsive behavior.

### Git Integration

Claude Code can automatically manage version control:

#### Auto-Commit with Descriptive Messages

```bash
claude-code modify src/components/Sidebar.tsx --add "dark mode toggle" --auto-commit
```

This generates a commit message like:
```
feat(sidebar): Add dark mode toggle

- Implement theme state management with React Context
- Add toggle button with icon animation
- Persist preference to localStorage
- Update Tailwind config for dark mode support
```

#### Branch Management

```bash
# Create feature branch and switch to it
claude-code git --create-branch feature/user-profiles

# Review uncommitted changes
claude-code git --review-diff

# Generate PR description
claude-code git --pr-description
```

### Custom Tools and Extensions

Extend Claude Code with project-specific scripts:

#### Example: Gemini API Wrapper

Create `scripts/claude-gemini-helper.sh`:

```bash
#!/bin/bash
# Custom tool to test Gemini API calls

PROMPT=$1
claude-code execute "
  Test the Gemini API with prompt: '$PROMPT'
  Use the service in src/services/geminiService.ts
  Log response time and token usage
  Validate response format
"
```

Register the tool:
```bash
claude-code tools --register scripts/claude-gemini-helper.sh --name gemini-test
```

Use it:
```bash
claude-code gemini-test "Generate an image of a sunset"
```

### Agentic Workflows

For complex, multi-step tasks, Claude Code can operate autonomously:

```bash
claude-code agent --task "Build a complete authentication flow with Supabase" --autonomous
```

Claude will:
1. **Plan**: Break down the task into steps
2. **Design**: Create database schema and types
3. **Implement**: Generate service layer, components, and pages
4. **Test**: Write and run unit/integration tests
5. **Document**: Add inline comments and README section
6. **Review**: Self-check for common issues
7. **Report**: Summarize changes and next steps

Monitor progress in real-time and approve/reject each major step.

### Collaborative Sessions

Enable multiple developers to work with the same AI context:

```bash
# Developer 1 starts session
claude-code collaborate --create-session app-refactor

# Developer 2 joins
claude-code collaborate --join-session app-refactor

# Both can contribute to the conversation and see shared context
```

Useful for pair programming or knowledge transfer.

---

## 6. Integration with Modern Tech Stacks

### React and Vite Projects

Claude Code understands modern React patterns and Vite configuration.

#### Generate Type-Safe React Components

```bash
claude-code create --type component --name UserProfileCard \
  --description "Display user avatar, name, email, and stats with loading skeleton" \
  --framework react \
  --typescript \
  --styling tailwind \
  --include-tests
```

Output structure:
```
src/components/UserProfileCard/
├── UserProfileCard.tsx
├── UserProfileCard.test.tsx
├── UserProfileCard.types.ts
└── index.ts
```

#### Debug Vite Configuration

```bash
claude-code debug "Vite build fails with alias resolution error" \
  --file vite.config.ts \
  --context tsconfig.json
```

#### Optimize Build Performance

```bash
claude-code refactor vite.config.ts \
  --optimize \
  --prompt "Improve build speed for large React app with code splitting and lazy loading"
```

### Supabase Integration

Claude Code can generate type-safe Supabase queries and schemas.

#### Generate Database Schema

```bash
claude-code create --type schema --name user_profiles \
  --description "Table for user profiles with avatar_url, display_name, bio, and created_at" \
  --database supabase
```

Output (`database/schema/user_profiles.sql`):
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON user_profiles FOR SELECT
  USING (true);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);
```

#### Create Type-Safe API Service

```bash
claude-code create --type service --name supabaseProfileService \
  --description "CRUD operations for user profiles with proper error handling" \
  --integrate supabase
```

### AI Service Integration

For apps using multiple AI services (like Gemini, OpenAI):

```bash
claude-code create --type service --name aiOrchestrator \
  --description "Unified interface for Gemini image generation and text completion with fallback logic" \
  --integrate gemini openai
```

Claude generates:
- Unified API interface
- Error handling and retry logic
- Response caching
- Token usage tracking
- Fallback between services

---

## 7. Troubleshooting and Tips

### Common Issues and Solutions

#### Issue: API Rate Limit Exceeded

**Error Message:**
```
Error: Rate limit exceeded (429)
```

**Solutions:**
1. Switch to a lighter model: `claude-code --model sonnet`
2. Clear context to reduce token usage: `/clear`
3. Implement request batching
4. Upgrade your API plan

#### Issue: Context Window Exceeded

**Error Message:**
```
Error: Maximum context length exceeded
```

**Solutions:**
1. Target specific files instead of entire directories
2. Use `/clear` to reset the conversation
3. Break tasks into smaller steps
4. Exclude large generated files (e.g., `node_modules/`)

#### Issue: Incorrect Code Generation

**Symptom:** Claude suggests code that doesn't match your setup

**Solutions:**
1. Verify `CLAUDE.md` exists and is accurate
2. Provide more context: "We use Supabase, not Firebase"
3. Share relevant config files: `--context package.json,tsconfig.json`
4. Push back: "This won't work because..."

#### Issue: Slow Performance

**Symptom:** Claude takes too long to respond

**Solutions:**
1. Use Sonnet for routine tasks (faster than Opus)
2. Reduce thinking budget: use `think` instead of `ultrathink`
3. Simplify prompts
4. Check your internet connection

### Performance Tips

#### Choose the Right Model

| Task Type | Recommended Model | Reasoning |
|-----------|------------------|-----------|
| Quick code generation | Sonnet 4 | Fast, cost-effective |
| Complex architecture | Opus 4.1 | Superior reasoning |
| Debugging | Sonnet 4 | Good balance |
| Refactoring | Opus 4.1 | Better code quality |
| Documentation | Sonnet 4 | Sufficient capability |

#### Optimize Token Usage

```bash
# Bad: Includes entire directory
claude-code review src/ --all-files

# Good: Targets specific files
claude-code review src/services/geminiService.ts src/pages/ImageGenerator.tsx
```

### Community Insights

From Reddit's r/ClaudeAI and developer forums:

1. **Use Claude for Refactoring, Not Greenfield**: Claude excels at improving existing code more than starting from scratch
2. **Always Test AI Outputs**: Especially for security-critical code
3. **Leverage for Tedious Tasks**: Boilerplate, migrations, test generation
4. **Combine with Human Expertise**: AI suggests, humans decide
5. **Version Control Everything**: Commit before AI changes, review diffs carefully

---

## 8. Resources and Further Learning

### Official Documentation

- **Claude Code Homepage**: [claude.ai/code](https://claude.ai/code)
- **API Reference**: [docs.anthropic.com/api](https://docs.anthropic.com/api)
- **CLI Documentation**: Complete command reference and examples

### Courses and Tutorials

#### Online Courses

- **"Claude Code: A Highly Agentic Coding Assistant"** by DeepLearning.AI
  - Hands-on projects with real-world examples
  - Covers basic to advanced workflows
  - Includes certification

#### Video Tutorials

- **"A Complete Guide to Claude Code for Engineers"** (YouTube)
  - Strategies for daily development workflows
  - Live coding demonstrations
  - Best practices from senior developers

### Blogs and Articles

- **Builder.io**: "How I Use Claude Code" - Practical tips for VS Code integration
- **Sabrina.dev**: Ultimate Guide to Claude Code - In-depth CLAUDE.md examples and prompt engineering
- **Anthropic Engineering Blog**: Regular updates on new features and research findings

### Community Resources

- **Reddit**: [r/ClaudeAI](https://reddit.com/r/ClaudeAI) - Active community sharing tips and experiences
- **Discord**: Anthropic Community Server - Direct access to developers and support
- **GitHub**: Example repositories and templates

### Books and Guides

- **"Cooking with Claude Code"**: Deep dive into CLI usage patterns
- **"Mastering Claude Code"** (Medium): Multi-part series on advanced techniques
- **"AI-Assisted Development Patterns"**: Broader guide to integrating AI into workflows

### Stay Updated

Claude Code is actively developed. Check for updates:

```bash
# Check current version
claude-code --version

# Update to latest
npm update -g claude-code
# or
brew upgrade claude-code
```

Follow Anthropic's official channels:
- **Twitter/X**: [@AnthropicAI](https://twitter.com/AnthropicAI)
- **Blog**: [anthropic.com/blog](https://anthropic.com/blog)
- **Changelog**: [anthropic.com/changelog](https://anthropic.com/changelog)

---

## Conclusion

Claude Code represents a significant evolution in AI-assisted development. By understanding its capabilities, following best practices, and integrating it thoughtfully into your workflow, you can achieve substantial productivity gains while maintaining code quality.

**Key Takeaways:**

1. **Start Small**: Begin with simple tasks like code review and refactoring
2. **Iterate Often**: Break complex tasks into manageable steps
3. **Review Everything**: AI is a tool, not a replacement for developer judgment
4. **Measure Impact**: Track productivity metrics to optimize usage
5. **Stay Informed**: Keep up with updates and community best practices

As you develop your web applications, remember that Claude Code is most effective when used as a collaborative partner—augmenting your skills, not replacing them. The goal is to spend less time on boilerplate and more time on creative problem-solving and architecture.

Happy coding!

---

*Last Updated: October 2025*
*Document Version: 1.0*
