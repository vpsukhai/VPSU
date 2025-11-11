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
    
    // Load results data based on session and exam type
    let resultsData = {};
    
    // Function to load appropriate JSON file
    function loadResultsData(session, examType) {
        const filename = `data/results-${session}-${examType.toLowerCase().replace(' ', '-')}.json`;
        
        fetch(filename)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Results not found for selected criteria');
                }
                return response.json();
            })
            .then(data => {
                resultsData = data;
            })
            .catch(error => {
                console.error('Error loading results:', error);
                resultsContainer.innerHTML = `
                    <div class="no-results">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>No results found for the selected session and exam type.</p>
                        <p>Please check back later or contact school administration.</p>
                    </div>
                `;
            });
    }
    
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
        
        // Load data for selected session and exam
        loadResultsData(session, exam);
        
        // Small delay to ensure data is loaded
        setTimeout(() => {
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
        }, 100);
    }
    
    // Display results function
    function displayResults(results, examType, session) {
        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>No results found matching your criteria</p>
                    <p>Please try different search parameters</p>
                </div>
            `;
            printArea.innerHTML = '';
            return;
        }
        
        let resultsHTML = '';
        
        results.forEach(result => {
            // Determine subjects based on class
            const subjects = getSubjectsForClass(result.Class);
            const totalMarks = getTotalMarksForClass(result.Class);
            
            // Create result card
            resultsHTML += `
                <div class="result-card" id="result-${result['Roll Number']}">
                    <div class="result-header">
                        <h3>${result.Name} - ${examType} Exam Result</h3>
                        <button class="print-btn no-print" onclick="printIndividualResult('${result['Roll Number']}', '${examType}', '${session}')">
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
                                    <th>Full Marks</th>
                                    <th>Pass Marks</th>
                                    <th>Marks Obtained</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${subjects.map(subject => `
                                    <tr>
                                        <td>${subject.name}</td>
                                        <td>${subject.fullMarks}</td>
                                        <td>${subject.passMarks}</td>
                                        <td>${result[subject.key] || 'N/A'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        
                        <div class="result-summary">
                            <div class="summary-item">
                                <h4>Total Marks</h4>
                                <p>${result.TOTAL} / ${totalMarks}</p>
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
    window.printIndividualResult = function(rollNumber, examType, session) {
        // Reload data to ensure we have the latest
        loadResultsData(session, examType);
        
        setTimeout(() => {
            const sessionKey = `Session ${session}`;
            const resultData = resultsData[sessionKey]?.find(r => 
                r['Roll Number'].toString() === rollNumber
            );
            
            if (!resultData) {
                alert('Result data not found for printing');
                return;
            }
            
            const subjects = getSubjectsForClass(resultData.Class);
            const totalMarks = getTotalMarksForClass(resultData.Class);
            
            const printHTML = `
                <div class="print-result">
                    <div class="print-header">
                        <img src="images/logo.png" alt="Veena Public School Logo" onerror="this.style.display='none'">
                        <div>
                            <h2>Veena Public School</h2>
                            <p>Ukhai, Siwan, Bihar - 841227</p>
                            <h3>${examType} Examination ${session}</h3>
                            <p>Report Card</p>
                        </div>
                    </div>
                    
                    <div class="student-info">
                        <div class="info-grid">
                            <div><strong>Student Name:</strong> ${resultData.Name}</div>
                            <div><strong>Class:</strong> ${resultData.Class} ${resultData.Section || ''}</div>
                            <div><strong>Roll No:</strong> ${resultData['Roll Number']}</div>
                            <div><strong>Admission No:</strong> ${resultData['Admission Number'] || 'N/A'}</div>
                            <div><strong>Father's Name:</strong> ${resultData['Fathers Name']}</div>
                            <div><strong>Mother's Name:</strong> ${resultData['Mothers Name']}</div>
                            <div><strong>Date of Birth:</strong> ${resultData.DOB}</div>
                        </div>
                    </div>
                    
                    <table class="result-table">
                        <thead>
                            <tr>
                                <th>Subject</th>
                                <th>Full Marks</th>
                                <th>Pass Marks</th>
                                <th>Marks Obtained</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${subjects.map(subject => `
                                <tr>
                                    <td>${subject.name}</td>
                                    <td>${subject.fullMarks}</td>
                                    <td>${subject.passMarks}</td>
                                    <td>${resultData[subject.key] || 'N/A'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <div class="result-summary">
                        <div class="summary-grid">
                            <div class="summary-item">
                                <strong>Total Marks:</strong> ${resultData.TOTAL} / ${totalMarks}
                            </div>
                            <div class="summary-item">
                                <strong>Percentage:</strong> ${resultData.PERCENTAGE}%
                            </div>
                            <div class="summary-item">
                                <strong>Division:</strong> ${resultData.DIVISION}
                            </div>
                        </div>
                    </div>
                    
                    <div class="print-footer">
                        <div class="signature-area">
                            <div class="signature">
                                <p>Class Teacher</p>
                            </div>
                            <div class="signature">
                                <p>Principal</p>
                            </div>
                        </div>
                        <p class="print-date">Generated on: ${new Date().toLocaleDateString()}</p>
                        <p class="disclaimer">Note: This is a computer generated result. For official purposes, please contact school administration.</p>
                    </div>
                </div>
            `;
            
            // Create a new window for printing
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Result - ${resultData.Name}</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            margin: 20px; 
                            color: #000;
                        }
                        .print-result { 
                            max-width: 800px; 
                            margin: 0 auto; 
                        }
                        .print-header { 
                            text-align: center; 
                            margin-bottom: 30px; 
                            border-bottom: 2px solid #333;
                            padding-bottom: 20px;
                        }
                        .print-header img { 
                            height: 80px; 
                            margin-bottom: 10px;
                        }
                        .print-header h2 { 
                            margin: 5px 0; 
                            color: #1a4b8e;
                        }
                        .print-header h3 { 
                            margin: 10px 0; 
                            color: #333;
                        }
                        .student-info { 
                            margin: 20px 0; 
                        }
                        .info-grid {
                            display: grid;
                            grid-template-columns: repeat(2, 1fr);
                            gap: 10px;
                        }
                        .result-table { 
                            width: 100%; 
                            border-collapse: collapse; 
                            margin: 20px 0; 
                        }
                        .result-table th, .result-table td { 
                            border: 1px solid #000; 
                            padding: 8px; 
                            text-align: center; 
                        }
                        .result-table th { 
                            background-color: #f0f0f0; 
                        }
                        .result-summary { 
                            margin: 20px 0; 
                        }
                        .summary-grid {
                            display: grid;
                            grid-template-columns: repeat(3, 1fr);
                            gap: 20px;
                            text-align: center;
                        }
                        .summary-item {
                            padding: 10px;
                            background: #f8f9fa;
                            border-radius: 5px;
                        }
                        .print-footer { 
                            margin-top: 40px; 
                            text-align: center; 
                        }
                        .signature-area {
                            display: flex;
                            justify-content: space-around;
                            margin: 40px 0 20px 0;
                        }
                        .signature {
                            border-top: 1px solid #000;
                            width: 150px;
                            text-align: center;
                            padding-top: 5px;
                        }
                        .print-date {
                            font-size: 0.9em;
                            color: #666;
                        }
                        .disclaimer {
                            font-size: 0.8em;
                            color: #999;
                            margin-top: 20px;
                        }
                        @media print {
                            body { margin: 0; }
                            .print-result { margin: 0; }
                        }
                    </style>
                </head>
                <body>
                    ${printHTML}
                    <script>
                        window.onload = function() {
                            window.print();
                            setTimeout(function() {
                                window.close();
                            }, 500);
                        };
                    <\/script>
                </body>
                </html>
            `);
            printWindow.document.close();
        }, 200);
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