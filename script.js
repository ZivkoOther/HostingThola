 const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');
        const filesList = document.getElementById('filesList');
        const submitSection = document.getElementById('submitSection');
        const submitBtn = document.getElementById('submitBtn');
        const clearBtn = document.getElementById('clearBtn');
        const successMessage = document.getElementById('successMessage');
        const browseBtn = document.querySelector('.browse-btn');
        const fileCount = document.getElementById('fileCount');

        let selectedFiles = [];

        browseBtn.addEventListener('click', () => fileInput.click());
        dropZone.addEventListener('click', (e) => {
            if (e.target === dropZone || e.target.closest('.drop-zone-content')) {
                fileInput.click();
            }
        });

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.add('dragover');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.remove('dragover');
            });
        });

        dropZone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            handleFiles(files);
        });

        fileInput.addEventListener('change', (e) => {
            handleFiles(e.target.files);
        });

        function handleFiles(files) {
            const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/jpg', 'image/png'];
            const maxSize = 10 * 1024 * 1024;

            Array.from(files).forEach(file => {
                if (!validTypes.includes(file.type)) {
                    alert(`${file.name} is not a supported file type.`);
                    return;
                }
                if (file.size > maxSize) {
                    alert(`${file.name} is too large. Maximum size is 10MB.`);
                    return;
                }
                
                const isDuplicate = selectedFiles.some(f => f.name === file.name && f.size === file.size);
                if (!isDuplicate) {
                    selectedFiles.push(file);
                }
            });

            displayFiles();
        }

        function displayFiles() {
            filesList.innerHTML = '';
            
            if (selectedFiles.length > 0) {
                submitSection.style.display = 'flex';
                fileCount.style.display = 'block';
                fileCount.textContent = `${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}`;
                
                selectedFiles.forEach((file, index) => {
                    const fileItem = document.createElement('div');
                    fileItem.className = 'file-item';
                    fileItem.innerHTML = `
                        <div class="file-item-left">
                            <div class="file-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                                    <polyline points="13 2 13 9 20 9"></polyline>
                                </svg>
                            </div>
                            <div class="file-details">
                                <div class="file-name">${file.name}</div>
                                <div class="file-size">${formatFileSize(file.size)}</div>
                            </div>
                        </div>
                        <button class="remove-btn" onclick="removeFile(${index})">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    `;
                    filesList.appendChild(fileItem);
                });
            } else {
                submitSection.style.display = 'none';
                fileCount.style.display = 'none';
            }
        }

        function removeFile(index) {
            selectedFiles.splice(index, 1);
            displayFiles();
        }

        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
        }

        clearBtn.addEventListener('click', () => {
            selectedFiles = [];
            fileInput.value = '';
            displayFiles();
            successMessage.innerHTML = '';
        });

        submitBtn.addEventListener('click', () => {
            if (selectedFiles.length === 0) return;

            submitBtn.disabled = true;
            submitBtn.querySelector('span').textContent = 'Uploading...';

            setTimeout(() => {
                successMessage.innerHTML = `
                    <div class="success-message">
                        ✓ Successfully uploaded ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}!
                    </div>
                `;
                
                selectedFiles = [];
                fileInput.value = '';
                displayFiles();
                submitBtn.disabled = false;
                submitBtn.querySelector('span').textContent = 'Upload Files';

                setTimeout(() => {
                    successMessage.innerHTML = '';
                }, 4000);
            }, 1500);
        });

        window.removeFile = removeFile;