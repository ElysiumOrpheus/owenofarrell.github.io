document.addEventListener('DOMContentLoaded', () => {
    const output = document.getElementById('output');
    const commandInput = document.getElementById('command-input');
    const promptElement = document.getElementById('prompt');
    const cursor = document.getElementById('cursor');
    const inputLine = document.querySelector('.input-line');
    const terminal = document.getElementById('terminal');
    const splashScreen = document.getElementById('splash-screen');

    const audioManager = {
        keySounds: [],
        bootSound: null,
        keySoundPool: [],
        poolSize: 10,
        currentKeySound: 0,
        init() {
            this.bootSound = document.getElementById('boot-sound');
            const keySoundSources = document.querySelectorAll('audio[data-key-sound="true"]');
            
            for (let i = 0; i < this.poolSize; i++) {
                const sourceIndex = i % keySoundSources.length;
                const audio = new Audio(keySoundSources[sourceIndex].src);
                this.keySoundPool.push(audio);
            }
        },
        playBootSound() {
            if(this.bootSound) this.bootSound.play();
        },
        playKeySound() {
            if (this.keySoundPool.length === 0) return;
            this.keySoundPool[this.currentKeySound].play();
            this.currentKeySound = (this.currentKeySound + 1) % this.poolSize;
        }
    };

    const inputDisplay = document.createElement('span');
    inputDisplay.id = 'input-display';
    inputLine.insertBefore(inputDisplay, commandInput);

    let promptCachedWidth = 0;

    function updateCursorPosition() {
        if (promptCachedWidth === 0) {
            const promptStyle = window.getComputedStyle(promptElement);
            const promptMarginRight = parseFloat(promptStyle.marginRight);
            promptCachedWidth = promptElement.offsetWidth + promptMarginRight;
        }
        const textWidth = inputDisplay.offsetWidth;
        cursor.style.left = `${promptCachedWidth + textWidth}px`;
    }

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
I believe that a website should be more fun to look at, and even more so fun to design.
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
    let commandHistory = [];
    let historyIndex = -1;
    let mode = 'normal';
    let contactStep = 0;
    let contactData = {};
    let isRepeating = false;

    const bootSequence = [
        { text: 'CRITICAL_SUBSYSTEM_LINK ESTABLISHED...', delay: 100 },
        { text: 'MOUNTING /dev/consciousness... OK', delay: 200 },
        { text: 'INITIALIZING OFO-SHELL v2.3.7...', delay: 150 },
        { text: 'Welcome, operator. System ready.', delay: 100 },
        { text: "Type 'help' to interface.", delay: 50 }
    ];

    async function type(text, playSound = true, charDelay = 25) {
        return new Promise(resolve => {
            let i = 0;
            const line = document.createElement('div');
            output.appendChild(line);

            function typeChar() {
                if (i < text.length) {
                    if (playSound) {
                        audioManager.playKeySound();
                    }
                    line.textContent += text.charAt(i);
                    i++;
                    scrollToBottom();
                    setTimeout(typeChar, charDelay);
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
        terminal.scrollTop = terminal.scrollHeight;
    }

    function getCurrentDirectory() {
        let current = fileSystem['~'];
        for (let i = 1; i < currentPath.length; i++) {
            current = current.children[currentPath[i]];
        }
        return current.children;
    }

    async function handleContactInput(input) {
        switch (contactStep) {
            case 0:
                contactData.name = input;
                print(`> Email:`);
                contactStep++;
                break;
            case 1:
                contactData.email = input;
                print(`> Message:`);
                contactStep++;
                break;
            case 2:
                contactData.message = input;
                print(`Thank you, ${contactData.name}. Transmitting message...`);
                
                try {
                    const response = await fetch('https://formspree.io/f/xwpbdvjy', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify(contactData),
                    });

                    if (response.ok) {
                        print(`Message sent successfully. Returning to normal operation.`);
                    } else {
                        throw new Error('Transmission failed.');
                    }
                } catch (error) {
                    print(`Error: ${error.message} Could not send message.`);
                } finally {
                    mode = 'normal';
                    contactStep = 0;
                    contactData = {};
                }
                break;
        }
    }

    function executeCommand(command) {
        const parts = command.trim().split(' ');
        const cmd = parts[0].toLowerCase();
        const arg = parts.slice(1).join(' ');

        switch (cmd) {
            case 'help':
                print(`Available commands:
<span style="color: #64ffda;">about</span>      - Display summary about me.
<span style="color: #64ffda;">projects</span>   - List my projects.
<span style="color: #64ffda;">skills</span>     - List my technical skills.
<span style="color: #64ffda;">contact</span>    - Open a secure channel to contact me.
<span style="color: #64ffda;">clear</span>      - Clear the terminal screen.
<span style="color: #64ffda;">reboot</span>     - Reboot the system.
<span style="color: #64ffda;">ls</span>         - List directory contents.
<span style="color: #64ffda;">cd [dir]</span>   - Change directory.
<span style="color: #64ffda;">cat [file]</span>   - Display file content.`);
                break;
            case 'about':
                print(`<pre>${fileSystem['~'].children['about.txt'].content}</pre>`);
                break;
            case 'projects':
                const projects = fileSystem['~'].children.projects.children;
                let projectsOutput = 'Projects:\n';
                for (const project in projects) {
                    projectsOutput += `- <a href="#" onclick="executeCommand('cat projects/${project}'); return false;" style="color: #82aaff;">${project.replace('.md', '')}</a>\n`;
                }
                print(projectsOutput);
                break;
            case 'skills':
                const skillsData = JSON.parse(fileSystem['~'].children['skills.json'].content);
                let skillsOutput = '';
                for (const category in skillsData) {
                    skillsOutput += `\n<span style="color: #64ffda;">${category}:</span>\n`;
                    skillsOutput += skillsData[category].join(', ');
                    skillsOutput += '\n';
                }
                print(skillsOutput);
                break;
            case 'contact':
                mode = 'contact';
                contactStep = 0;
                contactData = {};
                print('Starting secure contact protocol...');
                print('> Name:');
                break;
            case 'reboot':
                output.innerHTML = '';
                boot();
                break;
            case 'matrix':
                terminal.style.display = 'none';
                setTimeout(() => {
                    terminal.style.display = 'block';
                    scrollToBottom();
                }, 4000);
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
                const pathParts = arg.split('/');
                let targetDir = pathParts.length > 1 ? fileSystem['~'].children[pathParts[0]].children : getCurrentDirectory();
                const fileName = pathParts.length > 1 ? pathParts[1] : pathParts[0];

                if (targetDir[fileName] && targetDir[fileName].type === 'file') {
                    print(`<pre>${targetDir[fileName].content}</pre>`);
                } else if (targetDir[fileName] && targetDir[fileName].type === 'directory') {
                    print(`cat: ${arg}: Is a directory`);
                } else {
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

    window.executeCommand = executeCommand;

    commandInput.addEventListener('input', () => {
        if (!isRepeating) {
            audioManager.playKeySound();
        }
        inputDisplay.textContent = commandInput.value;
        updateCursorPosition();
    });
    
    commandInput.addEventListener('keyup', () => {
        isRepeating = false;
    });

    commandInput.addEventListener('keydown', (e) => {
        isRepeating = e.repeat;
        const command = commandInput.value.trim();

        if (e.key === 'Enter') {
            e.preventDefault();
            
            if (mode === 'contact') {
                print(`> ${command}`);
                handleContactInput(command);
            } else {
                const currentPrompt = `operator@owenofarrell:${currentPath.join('/').replace(/^~/, '~')}$`;
                print(`<span class="prompt">${currentPrompt}</span> ${command}`);
                if (command) {
                    commandHistory.push(command);
                    historyIndex = commandHistory.length;
                    executeCommand(command);
                }
            }
            
            commandInput.value = '';
            inputDisplay.textContent = '';
            promptElement.textContent = mode === 'contact' ? '>' : `operator@owenofarrell:${currentPath.join('/').replace(/^~/, '~')}$`;
            promptCachedWidth = 0;
            updateCursorPosition();
            scrollToBottom();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (mode === 'normal' && historyIndex > 0) {
                historyIndex--;
                commandInput.value = commandHistory[historyIndex];
                inputDisplay.textContent = commandInput.value;
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (mode === 'normal' && historyIndex < commandHistory.length - 1) {
                historyIndex++;
                commandInput.value = commandHistory[historyIndex];
                inputDisplay.textContent = commandInput.value;
            } else if (mode === 'normal') {
                historyIndex = commandHistory.length;
                commandInput.value = '';
                inputDisplay.textContent = '';
            }
        }
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
    for (let x = 0; x < columns; x++) { rainDrops[x] = 1; }
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
    
    let hasInteracted = false;
    splashScreen.addEventListener('click', () => {
        if (hasInteracted) return;
        hasInteracted = true;

        splashScreen.classList.add('hidden');
        terminal.classList.remove('hidden');
        
        audioManager.init();
        
        boot();
        
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
        setInterval(drawMatrix, 33);
    }, { once: true });

    async function boot() {
        commandInput.disabled = true;
        inputLine.style.display = 'none';
        
        audioManager.playBootSound();

        for (const line of bootSequence) {
            await type(line.text, false, 15); 
            await new Promise(resolve => setTimeout(resolve, line.delay));
        }

        inputLine.style.display = 'flex';
        commandInput.disabled = false;
        commandInput.focus();
        promptElement.textContent = `operator@owenofarrell:${currentPath.join('/').replace(/^~/, '~')}$`;
        promptCachedWidth = 0;
        updateCursorPosition();
    }
});