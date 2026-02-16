import { GoogleGenerativeAI } from '@google/generative-ai';

// ========================================
// TASK MANAGEMENT
// ========================================

interface Task {
  id: number;
  text: string;
  completed: boolean;
  createdAt: Date;
}

let tasks: Task[] = [
  { id: 1, text: "Try asking AI to add tasks!", completed: false, createdAt: new Date() }
];

function renderTasks() {
  const taskListEl = document.getElementById('taskList')!;
  const totalTasksEl = document.getElementById('totalTasks')!;
  const completedTasksEl = document.getElementById('completedTasks')!;
  const pendingTasksEl = document.getElementById('pendingTasks')!;

  if (tasks.length === 0) {
    taskListEl.innerHTML = `
      <div class="empty-state">
        <div style="font-size: 3em; margin-bottom: 15px;">📝</div>
        <p>No tasks yet! Ask AI to add some.</p>
      </div>
    `;
  } else {
    taskListEl.innerHTML = tasks
      .map(task => `
        <div class="task ${task.completed ? 'completed' : ''}">
          <span class="task-text">${task.text}</span>
          <span class="task-icon">${task.completed ? '✅' : '⭕'}</span>
        </div>
      `)
      .join('');
  }

  const completed = tasks.filter(t => t.completed).length;
  const pending = tasks.length - completed;

  totalTasksEl.textContent = tasks.length.toString();
  completedTasksEl.textContent = completed.toString();
  pendingTasksEl.textContent = pending.toString();
}

// ========================================
// TOOL DEFINITIONS
// ========================================

const tools = [
  {
    name: 'add_task',
    description: 'Add a new task to the task list',
    parameters: {
      type: 'object',
      properties: {
        taskText: {
          type: 'string',
          description: 'The text description of the task'
        }
      },
      required: ['taskText']
    },
    execute: (args: any) => {
      const newTask: Task = {
        id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
        text: args.taskText,
        completed: false,
        createdAt: new Date()
      };
      tasks.push(newTask);
      renderTasks();
      return `✅ Task added: "${args.taskText}" (ID: ${newTask.id})`;
    }
  },
  {
    name: 'complete_task',
    description: 'Mark a specific task as completed',
    parameters: {
      type: 'object',
      properties: {
        taskId: {
          type: 'number',
          description: 'The ID of the task to complete'
        }
      },
      required: ['taskId']
    },
    execute: (args: any) => {
      const task = tasks.find(t => t.id === args.taskId);
      if (!task) {
        return `❌ Task ${args.taskId} not found. Available: ${tasks.map(t => t.id).join(', ')}`;
      }
      if (task.completed) {
        return `ℹ️ Task "${task.text}" is already completed.`;
      }
      task.completed = true;
      renderTasks();
      return `✅ Completed: "${task.text}"`;
    }
  },
  {
    name: 'get_tasks',
    description: 'Get all tasks or filter by status',
    parameters: {
      type: 'object',
      properties: {
        filter: {
          type: 'string',
          description: 'Filter: "all", "completed", or "pending"',
          enum: ['all', 'completed', 'pending']
        }
      }
    },
    execute: (args: any) => {
      const filter = args.filter || 'all';
      let filtered = tasks;
      
      if (filter === 'completed') filtered = tasks.filter(t => t.completed);
      if (filter === 'pending') filtered = tasks.filter(t => !t.completed);
      
      if (filtered.length === 0) {
        return `📝 No ${filter === 'all' ? '' : filter} tasks found.`;
      }
      
      const taskList = filtered
        .map(t => `[${t.id}] ${t.completed ? '✅' : '⭕'} ${t.text}`)
        .join('\n');
      
      return `📋 Tasks (${filter}):\n${taskList}\n\nTotal: ${tasks.length} | Completed: ${tasks.filter(t => t.completed).length}`;
    }
  },
  {
    name: 'delete_task',
    description: 'Delete a task by ID',
    parameters: {
      type: 'object',
      properties: {
        taskId: {
          type: 'number',
          description: 'The ID of the task to delete'
        }
      },
      required: ['taskId']
    },
    execute: (args: any) => {
      const index = tasks.findIndex(t => t.id === args.taskId);
      if (index === -1) {
        return `❌ Task ${args.taskId} not found.`;
      }
      const deleted = tasks.splice(index, 1)[0];
      renderTasks();
      return `🗑️ Deleted: "${deleted.text}"`;
    }
  },
  {
    name: 'clear_completed',
    description: 'Remove all completed tasks',
    parameters: {
      type: 'object',
      properties: {}
    },
    execute: () => {
      const count = tasks.filter(t => t.completed).length;
      if (count === 0) {
        return '✨ No completed tasks to clear.';
      }
      tasks = tasks.filter(t => !t.completed);
      renderTasks();
      return `🧹 Cleared ${count} completed task${count > 1 ? 's' : ''}`;
    }
  },
  {
    name: 'get_stats',
    description: 'Get task statistics',
    parameters: {
      type: 'object',
      properties: {}
    },
    execute: () => {
      const total = tasks.length;
      const completed = tasks.filter(t => t.completed).length;
      const pending = total - completed;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      return `📊 Statistics:\n• Total: ${total}\n• Completed: ${completed}\n• Pending: ${pending}\n• Completion Rate: ${rate}%`;
    }
  }
];

// ========================================
// AI INTEGRATION
// ========================================

let genAI: GoogleGenerativeAI | null = null;
let model: any = null;
let chat: any = null;

const chatMessagesEl = document.getElementById('chatMessages')!;
const chatInputEl = document.getElementById('chatInput') as HTMLInputElement;
const sendButtonEl = document.getElementById('sendButton') as HTMLButtonElement;
const apiKeyInputEl = document.getElementById('apiKeyInput') as HTMLInputElement;
const saveApiKeyEl = document.getElementById('saveApiKey') as HTMLButtonElement;
const apiStatusEl = document.getElementById('apiStatus')!;
const apiKeySetupEl = document.getElementById('apiKeySetup')!;
const typingIndicatorEl = document.getElementById('typingIndicator')!;

// Load saved API key
const savedApiKey = localStorage.getItem('gemini_api_key');
if (savedApiKey) {
  initializeAI(savedApiKey);
}

function addMessage(text: string, type: 'user' | 'assistant' | 'system' | 'error') {
  const messageEl = document.createElement('div');
  messageEl.className = `message ${type}`;
  messageEl.textContent = text;
  chatMessagesEl.appendChild(messageEl);
  chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
}

function initializeAI(apiKey: string) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    
    // Convert tools to Gemini format
    const geminiTools = {
      functionDeclarations: tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters
      }))
    };
    
    model = genAI.getGenerativeModel({
      model: 'gemini-pro',
      tools: [geminiTools]
    });
    
    chat = model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });
    
    localStorage.setItem('gemini_api_key', apiKey);
    
    apiStatusEl.textContent = '✅ Connected';
    apiStatusEl.className = 'api-status connected';
    apiKeySetupEl.style.display = 'none';
    chatInputEl.disabled = false;
    sendButtonEl.disabled = false;
    
    addMessage('🎉 Connected! I can now help you manage tasks. Try asking me to add a task!', 'system');
    
  } catch (error: any) {
    addMessage(`❌ Failed to connect: ${error.message}`, 'error');
    apiStatusEl.textContent = '❌ Connection Failed';
    apiStatusEl.className = 'api-status disconnected';
  }
}

async function handleUserMessage(userInput: string) {
  if (!chat) {
    addMessage('⚠️ Please set up your API key first.', 'error');
    return;
  }
  
  addMessage(userInput, 'user');
  chatInputEl.value = '';
  sendButtonEl.disabled = true;
  typingIndicatorEl.classList.add('active');
  
  try {
    const result = await chat.sendMessage(userInput);
    const response = result.response;
    
    // Check if AI wants to use tools
    const functionCalls = response.functionCalls();
    
    if (functionCalls && functionCalls.length > 0) {
      // Execute tools and collect results
      const functionResponses = functionCalls.map((call: any) => {
        const tool = tools.find(t => t.name === call.name);
        if (!tool) {
          return {
            name: call.name,
            response: { error: 'Tool not found' }
          };
        }
        
        const result = tool.execute(call.args);
        addMessage(result, 'system');
        
        return {
          name: call.name,
          response: { result }
        };
      });
      
      // Send function responses back to AI for final response
      const finalResult = await chat.sendMessage([{
        functionResponses
      }]);
      
      const finalText = finalResult.response.text();
      if (finalText) {
        addMessage(finalText, 'assistant');
      }
    } else {
      // Regular response without tool use
      const text = response.text();
      addMessage(text, 'assistant');
    }
    
  } catch (error: any) {
    console.error('Chat error:', error);
    addMessage(`❌ Error: ${error.message}`, 'error');
  } finally {
    typingIndicatorEl.classList.remove('active');
    sendButtonEl.disabled = false;
    chatInputEl.focus();
  }
}

// ========================================
// EVENT LISTENERS
// ========================================

saveApiKeyEl.addEventListener('click', () => {
  const apiKey = apiKeyInputEl.value.trim();
  if (!apiKey) {
    alert('Please enter an API key');
    return;
  }
  initializeAI(apiKey);
});

sendButtonEl.addEventListener('click', () => {
  const input = chatInputEl.value.trim();
  if (input) {
    handleUserMessage(input);
  }
});

chatInputEl.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !sendButtonEl.disabled) {
    const input = chatInputEl.value.trim();
    if (input) {
      handleUserMessage(input);
    }
  }
});

// Suggestion chips
document.querySelectorAll('.suggestion-chip').forEach(chip => {
  chip.addEventListener('click', (e) => {
    const text = (e.target as HTMLElement).dataset.text;
    if (text && !sendButtonEl.disabled) {
      chatInputEl.value = text;
      handleUserMessage(text);
    }
  });
});

// Initialize
renderTasks();
console.log('✅ WebMCP Standalone POC loaded!');
console.log('🛠️ Tools available:', tools.map(t => t.name).join(', '));