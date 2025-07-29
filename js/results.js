document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const sessionSelect = document.getElementById('session-select');
    const examSelect = document.getElementById('exam-select');
    const classSelect = document.getElementById('class-select');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const resultsContainer = document.getElementById('results-container');
    const printArea = document.getElementById('print-area');
    
    // Current academic year
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    const currentSession = `${currentYear}-${nextYear.toString().slice(-2)}`;
    
    // Set current session as default
    sessionSelect.value = currentSession;
    
    // Load results data
    let resultsData = {};
    
    // Fetch results data from JSON
    fetch('data/results.json')
        .then(response => response.json())
        .then(data => {
            resultsData = data;
        })
        .catch(error => {
            console.error('Error loading results:', error);
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to load results. Please try again later.</p>
                </div>
            `;
        });
    
    // Search function
    function searchResults() {
        const session = sessionSelect.value;
        const exam = examSelect.value;
        const classVal = classSelect.value;
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        if (!session) {
            alert('Please select an academic session');
            return;
        }
        
        if (!exam) {
            alert('Please select an exam type');
            return;
        }
        
        // Filter results based on selections
        let filteredResults = [];
        const sessionKey = `Session ${session}`;
        
        if (resultsData[sessionKey]) {
            filteredResults = resultsData[sessionKey].filter(result => {
                // Match class if selected
                const classMatch = !classVal || result.Class === classVal;
                
                // Match search term if entered
                const searchMatch = !searchTerm || 
                    result.Name.toLowerCase().includes(searchTerm) || 
                    result['Roll Number'].toString().includes(searchTerm);
                
                return classMatch && searchMatch;
            });
        }
        
        // Display results
        displayResults(filteredResults, exam, session);
    }
    
    // Display results function
    function displayResults(results, examType, session) {
        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>No results found matching your criteria</p>
                </div>
            `;
            printArea.innerHTML = '';
            return;
        }
        
        let resultsHTML = '';
        let printHTML = '';
        
        results.forEach(result => {
            // Determine subjects based on class
            const subjects = getSubjectsForClass(result.Class);
            const totalMarks = getTotalMarksForClass(result.Class);
            
            // Create result card
            resultsHTML += `
                <div class="result-card" id="result-${result['Roll Number']}">
                    <div class="result-header">
                        <h3>${result.Name} - ${examType} Exam Result</h3>
                        <button class="print-btn no-print" onclick="printResult('result-${result['Roll Number']}', '${examType}', '${session}')">
                            <i class="fas fa-print"></i> Print
                        </button>
                    </div>
                    <div class="result-body">
                        <div class="student-info">
                            <div class="info-item"><strong>Class:</strong> ${result.Class} ${result.Section || ''}</div>
                            <div class="info-item"><strong>Roll No:</strong> ${result['Roll Number']}</div>
                            <div class="info-item"><strong>Admission No:</strong> ${result['Admission Number'] || 'N/A'}</div>
                            <div class="info-item"><strong>DOB:</strong> ${result.DOB}</div>
                            <div class="info-item"><strong>Father's Name:</strong> ${result['Fathers Name']}</div>
                            <div class="info-item"><strong>Mother's Name:</strong> ${result['Mothers Name']}</div>
                        </div>
                        
                        <table class="result-table">
                            <thead>
                                <tr>
                                    <th>Subject</th>
                                    ${totalMarks ? '<th>Full Marks</th>' : ''}
                                    <th>Pass Marks</th>
                                    <th>Marks Obtained</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${subjects.map(subject => `
                                    <tr>
                                        <td>${subject.name}</td>
                                        ${totalMarks ? `<td>${subject.fullMarks}</td>` : ''}
                                        <td>${subject.passMarks}</td>
                                        <td>${result[subject.key] || 'N/A'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        
                        <div class="result-summary">
                            <div class="summary-item">
                                <h4>Total Marks</h4>
                                <p>${result.TOTAL} ${totalMarks ? `/ ${totalMarks}` : ''}</p>
                            </div>
                            <div class="summary-item">
                                <h4>Percentage</h4>
                                <p>${result.PERCENTAGE}%</p>
                            </div>
                            <div class="summary-item">
                                <h4>Division</h4>
                                <p>${result.DIVISION}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        resultsContainer.innerHTML = resultsHTML;
    }
    
    // Get subjects based on class
    function getSubjectsForClass(className) {
        // Class I-VIII (1000 marks)
        if (['I','II','III','IV','V','VI','VII','VIII'].includes(className)) {
            return [
                { name: 'Hindi', key: 'HINDI', fullMarks: 100, passMarks: 30 },
                { name: 'English', key: 'ENGLISH', fullMarks: 100, passMarks: 30 },
                { name: 'Mathematics', key: 'MATHS', fullMarks: 100, passMarks: 30 },
                { name: 'Science', key: 'SCIENCE', fullMarks: 100, passMarks: 30 },
                { name: 'Social Science', key: 'SOCIAL SCIENCE', fullMarks: 100, passMarks: 30 },
                { name: 'Sanskrit/Urdu', key: 'SNK/URDU', fullMarks: 100, passMarks: 30 },
                { name: 'General Knowledge', key: 'G.K', fullMarks: 100, passMarks: 30 },
                { name: 'Computer', key: 'COMPUTER', fullMarks: 100, passMarks: 30 },
                { name: 'Drawing', key: 'DRAWING', fullMarks: 50, passMarks: 15 },
                { name: 'Handicraft/SCA/Music', key: 'H.CRAFT/ SCA/Music', fullMarks: 50, passMarks: 15 },
                { name: 'Oral', key: 'ORAL', fullMarks: 50, passMarks: 15 },
                { name: 'PT Uniform', key: 'PT Uniform', fullMarks: 50, passMarks: 15 }
            ];
        }
        // UKG (800 marks)
        else if (className === 'UKG') {
            return [
                { name: 'Hindi', key: 'HINDI', fullMarks: 100, passMarks: 30 },
                { name: 'English', key: 'ENGLISH', fullMarks: 100, passMarks: 30 },
                { name: 'Mathematics', key: 'MATHS', fullMarks: 100, passMarks: 30 },
                { name: 'Science', key: 'SCIENCE', fullMarks: 100, passMarks: 30 },
                { name: 'Social Science', key: 'SOCIAL SCIENCE', fullMarks: 100, passMarks: 30 },
                { name: 'General Knowledge', key: 'G.K', fullMarks: 100, passMarks: 30 },
                { name: 'Drawing', key: 'DRAWING', fullMarks: 50, passMarks: 15 },
                { name: 'Handicraft', key: 'H.CRAFT', fullMarks: 50, passMarks: 15 },
                { name: 'Music/Uniform', key: 'Music/Uniform', fullMarks: 50, passMarks: 15 },
                { name: 'Oral', key: 'ORAL', fullMarks: 50, passMarks: 15 }
            ];
        }
        // LKG and Nursery (500 marks)
        else if (['LKG', 'Nursery'].includes(className)) {
            return [
                { name: 'Hindi', key: 'HINDI', fullMarks: 100, passMarks: 30 },
                { name: 'English', key: 'ENGLISH', fullMarks: 100, passMarks: 30 },
                { name: 'Mathematics', key: 'MATHS', fullMarks: 100, passMarks: 30 },
                { name: 'Drawing', key: 'DRAWING', fullMarks: 50, passMarks: 15 },
                { name: 'Handicraft', key: 'H.CRAFT', fullMarks: 50, passMarks: 15 },
                { name: 'Music/Uniform', key: 'Music/Uniform', fullMarks: 50, passMarks: 15 },
                { name: 'Oral', key: 'ORAL', fullMarks: 50, passMarks: 15 }
            ];
        }
        return [];
    }
    
    // Get total marks based on class
    function getTotalMarksForClass(className) {
        if (['I','II','III','IV','V','VI','VII','VIII'].includes(className)) return 1000;
        if (className === 'UKG') return 800;
        if (['LKG', 'Nursery'].includes(className)) return 500;
        return 0;
    }
    
    // Print function (added to window for button click)
    window.printResult = function(resultId, examType, session) {
        const resultElement = document.getElementById(resultId);
        const resultData = resultsData[`Session ${session}`].find(r => 
            `result-${r['Roll Number']}` === resultId
        );
        
        const subjects = getSubjectsForClass(resultData.Class);
        const totalMarks = getTotalMarksForClass(resultData.Class);
        
        printArea.innerHTML = `
            <div class="print-result">
                <div class="print-header">
                    <img src="images/logo.png" alt="Veena Public School Logo">
                    <div>
                        <h2>Veena Public School</h2>
                        <p>Ukhai, Siwan, Bihar - 841227</p>
                        <h3>${examType} Examination - Session ${session}</h3>
                    </div>
                </div>
                
                <div class="student-info">
                    <div><strong>Name:</strong> ${resultData.Name}</div>
                    <div><strong>Class:</strong> ${resultData.Class} ${resultData.Section || ''}</div>
                    <div><strong>Roll No:</strong> ${resultData['Roll Number']}</div>
                    <div><strong>Admission No:</strong> ${resultData['Admission Number'] || 'N/A'}</div>
                </div>
                
                <table class="result-table">
                    <thead>
                        <tr>
                            <th>Subject</th>
                            <th>Marks Obtained</th>
                            ${totalMarks ? '<th>Full Marks</th>' : ''}
                        </tr>
                    </thead>
                    <tbody>
                        ${subjects.map(subject => `
                            <tr>
                                <td>${subject.name}</td>
                                <td>${resultData[subject.key] || 'N/A'}</td>
                                ${totalMarks ? `<td>${subject.fullMarks}</td>` : ''}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="result-summary">
                    <div><strong>Total Marks:</strong> ${resultData.TOTAL} ${totalMarks ? `/ ${totalMarks}` : ''}</div>
                    <div><strong>Percentage:</strong> ${resultData.PERCENTAGE}%</div>
                    <div><strong>Division:</strong> ${resultData.DIVISION}</div>
                </div>
                
                <div class="print-footer">
                    <p>Generated on: ${new Date().toLocaleDateString()}</p>
                    <p>This is a computer generated result and doesn't require signature.</p>
                    <p class="disclaimer">Note: This result is not valid for official purposes.</p>
                </div>
            </div>
        `;
        
        window.print();
    };
    
    // Event listeners
    searchBtn.addEventListener('click', searchResults);
    
    // Also search when pressing Enter in search field
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchResults();
        }
    });
    
    // Set current year in footer
    document.getElementById('current-year').textContent = currentYear;
});