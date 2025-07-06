document.addEventListener('DOMContentLoaded', () => {
    const output = document.getElementById('output');
    const commandInput = document.getElementById('command-input');
    const promptElement = document.getElementById('prompt');

    const fileSystem = {
        '~': {
            type: 'directory',
            children: {
                'projects': {
                    type: 'directory',
                    children: {
                        'oasis-radio.md': {
                            type: 'file',
                            content: `
Oasis Radio - Automated Radio Monitoring Pipeline

- Description: A python based system designed to automate radio monitoring. It continuously records multiple online radio streams, uses FFmpeg for audio capture, and uses OpenAI's Whisper model for real-time transcription. The transcribed text is then scanned for a predefined list of keywords. Upon a match, the system instantly sends a notification to a Discord channel, giving the context of the hit and mentioning the user if a hit is found.
- Tech Stack: Python, FFmpeg, OpenAI Whisper, Discord.py, YAML, Asyncio
- Repo: <a href="https://github.com/ElysiumOrpheus/Oasis-Radio" target="_blank" style="color: #64ffda;">View on GitHub</a>
- Live Demo: N/A (Backend Application)
`
                        },
                        'charlan-archives.md': {
                            type: 'file',
                            content: `
## Charlan Archives - Digital School Archive

- **Description:** A front-end website built to serve as a digital archive for Charlan District High School. The site allows users to browse and search a growing collection of digitized materials, currently only yearbooks. It uses JavaScript to fetch and search through Optical Character Recognition (OCR) text files, creating a makeshift searching tool without a real backend database. The project perfectly goes with accessibility and community involvement.
- **Tech Stack:** HTML, CSS, Vanilla JavaScript, GitHub Pages
- Repo: <a href="https://github.com/CharlanArchives/CharlanArchives.github.io" target="_blank" style="color: #64ffda;">View on GitHub</a>
- Live Demo: <a href="https://charlanarchives.github.io/" target="_blank" style="color: #64ffda;">View Live Site</a>
`
                        }
                    }
                },
                'about.txt': {
                    type: 'file',
                    content: `
Owen O'Farrell - Creative Developer

I am a highschool student with a passion for building unique, engaging and functional web experiences.
I believe that a website should be fun to look at, and even moreso fun to design.
This terminal is a testament to that philosophy.
`
                },
                'skills.json': {
                    type: 'file',
                    content: JSON.stringify({
                        "Languages": ["JavaScript (ES6+)", "Python", "HTML5", "CSS3/SCSS", "YAML"],
                        "Frameworks/Libraries": ["Discord.py", "Node.js"],
                        "AI/ML": ["OpenAI Whisper"],
                        "Tools & Platforms": ["Git", "GitHub/GitHub Pages", "FFmpeg", "Docker", "Asyncio/Threading"],
                        "Protocols/APIs": ["Discord Bot API"]
                    }, null, 2)
                }
            }
        }
    };

    let currentPath = ['~'];

    const bootSequence = [
        { text: 'CRITICAL_SUBSYSTEM_LINK ESTABLISHED...', delay: 100 },
        { text: 'MOUNTING /dev/consciousness... OK', delay: 200 },
        { text: 'INITIALIZING OFO-SHELL v2.3.7...', delay: 150 },
        { text: 'Welcome, operator. System ready.', delay: 100 },
        { text: "Type 'help' to interface.", delay: 50 }
    ];

    async function type(text, delay = 25) {
        return new Promise(resolve => {
            let i = 0;
            const line = document.createElement('div');
            output.appendChild(line);

            function typeChar() {
                if (i < text.length) {
                    line.textContent += text.charAt(i);
                    i++;
                    scrollToBottom();
                    setTimeout(typeChar, delay);
                } else {
                    resolve();
                }
            }
            typeChar();
        });
    }

    function print(text) {
        const line = document.createElement('div');
        line.innerHTML = text;
        output.appendChild(line);
        scrollToBottom();
    }
    
    function scrollToBottom() {
        const terminal = document.getElementById('terminal');
        terminal.scrollTop = terminal.scrollHeight;
    }

    function getCurrentDirectory() {
        let current = fileSystem;
        for (const dir of currentPath) {
            current = current[dir].children || current[dir];
        }
        return current;
    }

    function executeCommand(command) {
        const parts = command.trim().split(' ');
        const cmd = parts[0].toLowerCase();
        const arg = parts.slice(1).join(' ');

        switch (cmd) {
            case 'help':
                print(`Available commands:
    <span style="color: #64ffda;">help</span>     - Show this help message.
    <span style="color: #64ffda;">clear</span>    - Clear the terminal screen.
    <span style="color: #64ffda;">ls</span>       - List directory contents.
    <span style="color: #64ffda;">cd [dir]</span> - Change directory.
    <span style="color: #64ffda;">cat [file]</span> - Display file content.
    <span style="color: #64ffda;">whoami</span>   - Display user information.
    <span style="color: #64ffda;">date</span>     - Display the current system date.`);
                break;
            case 'clear':
                output.innerHTML = '';
                break;
            case 'whoami':
                print('You are the operator. I am the machine.');
                break;
            case 'date':
                print(new Date().toString());
                break;
            case 'ls':
                const currentDirLs = getCurrentDirectory();
                let lsOutput = '';
                for (const item in currentDirLs) {
                    if (currentDirLs[item].type === 'directory') {
                        lsOutput += `<span style="color: #82aaff;">${item}/</span>  `;
                    } else {
                        lsOutput += `${item}  `;
                    }
                }
                print(lsOutput.trim());
                break;
            case 'cd':
                if (!arg || arg === '~' || arg === '~/') {
                    currentPath = ['~'];
                } else if (arg === '..') {
                    if (currentPath.length > 1) {
                        currentPath.pop();
                    }
                } else {
                    const currentDirCd = getCurrentDirectory();
                    if (currentDirCd[arg] && currentDirCd[arg].type === 'directory') {
                        currentPath.push(arg);
                    } else {
                        print(`bash: cd: ${arg}: No such file or directory`);
                    }
                }
                break;
            case 'cat':
                if (!arg) {
                    print('cat: Missing operand');
                    break;
                }
                const dirCat = getCurrentDirectory();
                if (dirCat[arg] && dirCat[arg].type === 'file') {
                    print(`<pre>${dirCat[arg].content}</pre>`);
                } else if (dirCat[arg] && dirCat[arg].type === 'directory') {
                    print(`cat: ${arg}: Is a directory`);
                }
                else {
                    print(`cat: ${arg}: No such file or directory`);
                }
                break;
            case '':
                break;
            default:
                print(`bash: command not found: ${command}`);
                break;
        }
    }

    commandInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const command = commandInput.value.trim();
            const currentPrompt = `operator@owenofarrell:${currentPath.join('/').replace(/^~/, '~')}$`;
            
            print(`<span class="prompt">${currentPrompt}</span> ${command}`);
            
            if (command) {
                executeCommand(command);
            }
            
            commandInput.value = '';
            promptElement.textContent = `operator@owenofarrell:${currentPath.join('/').replace(/^~/, '~')}$`;
            scrollToBottom();
        }
    });

    document.body.addEventListener('click', () => {
        commandInput.focus();
    });

    const canvas = document.getElementById('matrix-canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
    const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    const alphabet = katakana + latin + nums;

    const fontSize = 16;
    const columns = canvas.width / fontSize;

    const rainDrops = [];
    for (let x = 0; x < columns; x++) {
        rainDrops[x] = 1;
    }

    function drawMatrix() {
        ctx.fillStyle = 'rgba(13, 13, 13, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#2C6E49';
        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < rainDrops.length; i++) {
            const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
            ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);

            if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                rainDrops[i] = 0;
            }
            rainDrops[i]++;
        }
    }

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    setInterval(drawMatrix, 33);

    async function boot() {
        commandInput.disabled = true;
        for (const line of bootSequence) {
            await type(line.text);
        }
        commandInput.disabled = false;
        commandInput.focus();
        promptElement.textContent = `operator@owenofarrell:${currentPath.join('/').replace(/^~/, '~')}$`;
    }

    boot();
});