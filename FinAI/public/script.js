/**
 * BlueNova Bank Variance Assistant
 * Main JavaScript file for the SPA
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM fully loaded');
  
  // Initialize page navigation
  initPageNavigation();
  
  // Initialize tool functionality
  initToolFunctionality();
  
  // Initialize language toggle
  initLanguageToggle();
  
  // Initialize FAQ items
  initFaqItems();
});

/**
 * Initialize simple page navigation
 */
function initPageNavigation() {
  console.log('Initializing page navigation');
  
  // Add click handlers to all navigation links
  const navLinks = document.querySelectorAll('.nav-link, .page-link');
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetPageId = this.getAttribute('data-page');
      if (!targetPageId) {
        console.error('Navigation link missing data-page attribute');
        return;
      }
      
      // Update active nav link
      document.querySelectorAll('.nav-link').forEach(navLink => {
        navLink.classList.remove('active');
      });
      
      // Find and activate the corresponding nav link
      const correspondingNavLink = document.querySelector(`.nav-link[data-page="${targetPageId}"]`);
      if (correspondingNavLink) {
        correspondingNavLink.classList.add('active');
      }
      
      // Show the target page
      showPage(targetPageId);
      
      // Update URL hash (without causing another navigation)
      const hash = this.getAttribute('href');
      window.history.pushState(null, '', hash);
    });
  });
  
  // Handle browser back/forward navigation
  window.addEventListener('popstate', function() {
    handleHashChange();
  });
  
  // Initial navigation based on URL hash
  handleHashChange();
}

/**
 * Handle hash change for page navigation
 */
function handleHashChange() {
  console.log('Handling hash change:', window.location.hash);
  
  let hash = window.location.hash;
  if (!hash) {
    hash = '#home'; // Default page
  }
  
  // Remove the hash symbol
  hash = hash.substring(1);
  
  // Map hash to page ID
  let pageId;
  switch (hash) {
    case 'home':
      pageId = 'homePage';
      break;
    case 'how-to':
      pageId = 'howToPage';
      break;
    case 'testimonials':
      pageId = 'testimonialsPage';
      break;
    case 'tool':
      pageId = 'toolPage';
      break;
    default:
      pageId = 'homePage'; // Default to home for unknown hashes
  }
  
  // Update active nav link
  document.querySelectorAll('.nav-link').forEach(navLink => {
    navLink.classList.remove('active');
  });
  
  const activeNavLink = document.querySelector(`.nav-link[data-page="${pageId}"]`);
  if (activeNavLink) {
    activeNavLink.classList.add('active');
  }
  
  // Show the page
  showPage(pageId);
}

/**
 * Show a specific page and hide others
 */
function showPage(pageId) {
  console.log('Showing page:', pageId);
  
  // Hide all pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  
  // Show the target page
  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.classList.add('active');
    
    // If showing the tool page, reset to first step
    if (pageId === 'toolPage') {
      showToolStep(0);
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
  } else {
    console.error('Page not found:', pageId);
  }
}

/**
 * Initialize language toggle functionality
 */
function initLanguageToggle() {
  const langToggle = document.getElementById('languageToggle');
  const langLabel = document.querySelector('.lang-label');
  
  if (langToggle && langLabel) {
    langToggle.addEventListener('click', function() {
      const currentLang = langLabel.textContent;
      langLabel.textContent = currentLang === 'DE' ? 'EN' : 'DE';
      console.log('Language switched to:', langLabel.textContent);
    });
  }
}

/**
 * Initialize FAQ item toggles
 */
function initFaqItems() {
  const faqQuestions = document.querySelectorAll('.faq-question');
  
  faqQuestions.forEach(question => {
    question.addEventListener('click', function() {
      const answer = this.nextElementSibling;
      const isVisible = answer.style.display === 'block';
      
      if (isVisible) {
        answer.style.display = 'none';
        this.classList.remove('active');
        this.setAttribute('aria-expanded', 'false');
      } else {
        answer.style.display = 'block';
        this.classList.add('active');
        this.setAttribute('aria-expanded', 'true');
      }
    });
    
    // Hide answers initially
    const answer = question.nextElementSibling;
    answer.style.display = 'none';
    question.setAttribute('aria-expanded', 'false');
  });
}

/**
 * Tool Step Process
 * A complete rewrite of the step-by-step functionality
 * Add this to script.js, replacing the existing initToolFunctionality function
 */

/**
 * Initialize all tool functionality
 */
function initToolFunctionality() {
  console.log('Initializing tool functionality');
  
  // State management
  const toolState = {
    currentStep: 0,
    segment: null,
    kpis: new Set(),
    mainDocuments: [],
    additionalDocuments: [],
    comments: '',
    analysisResults: null
  };

  // Make the state and functions globally available
  window.toolState = toolState;
  window.goToStep = goToStep;
  window.submitToBackend = submitToBackend;
  
  // Initialize the UI
  initStepIndicators();
  initSegmentSelection();
  initKpiSelection();
  initFileUploads();
  initNavigationButtons();
  
  // Show the first step
  goToStep(0);
  
  /**
   * Initialize step indicators
   */
  function initStepIndicators() {
    const stepIndicators = document.querySelectorAll('.step[data-tool-step]');
    stepIndicators.forEach(indicator => {
      indicator.addEventListener('click', function() {
        const stepIndex = parseInt(this.getAttribute('data-tool-step'));
        // Only allow clicking on completed steps or the current step + 1
        if (stepIndex <= toolState.currentStep + 1) {
          goToStep(stepIndex);
        }
      });
    });
  }
  
  /**
   * Initialize segment selection
   */
  function initSegmentSelection() {
    const options = document.querySelectorAll('#step1 .option');
    const nextButton = document.getElementById('step1Next');
    const validationMsg = document.getElementById('step1ValidationMsg');
    
    if (nextButton) {
      nextButton.disabled = true;
      
      nextButton.addEventListener('click', function() {
        if (!toolState.segment) {
          validationMsg.textContent = 'Bitte wählen Sie ein Segment aus.';
          return;
        }
        goToStep(1);
      });
    }
    
    options.forEach(option => {
      option.addEventListener('click', function() {
        // Clear any previous selection
        options.forEach(opt => opt.classList.remove('selected'));
        
        // Select this option
        this.classList.add('selected');
        toolState.segment = this.textContent;
        
        // Enable next button
        if (nextButton) {
          nextButton.disabled = false;
        }
        
        // Clear validation message
        if (validationMsg) {
          validationMsg.textContent = '';
        }
        
        console.log('Selected segment:', toolState.segment);
      });
    });
  }
  
  /**
   * Initialize KPI selection
   */
  function initKpiSelection() {
    const options = document.querySelectorAll('#step2 .option');
    const nextButton = document.getElementById('step2Next');
    const validationMsg = document.getElementById('step2ValidationMsg');
    const kpiCounter = document.getElementById('kpiCount');
    
    if (nextButton) {
      nextButton.disabled = true;
      
      nextButton.addEventListener('click', function() {
        if (toolState.kpis.size === 0) {
          validationMsg.textContent = 'Bitte wählen Sie mindestens eine KPI aus.';
          return;
        }
        goToStep(2);
      });
    }
    
    options.forEach(option => {
      option.addEventListener('click', function() {
        const kpiName = this.textContent;
        
        // Toggle selection
        this.classList.toggle('selected');
        
        if (this.classList.contains('selected')) {
          toolState.kpis.add(kpiName);
        } else {
          toolState.kpis.delete(kpiName);
        }
        
        // Update counter
        updateKpiCounter();
        
        // Enable/disable next button
        if (nextButton) {
          nextButton.disabled = toolState.kpis.size === 0;
        }
        
        // Clear validation message
        if (validationMsg) {
          validationMsg.textContent = '';
        }
        
        console.log('Selected KPIs:', Array.from(toolState.kpis));
      });
    });
    
    function updateKpiCounter() {
      if (!kpiCounter) return;
      
      const count = toolState.kpis.size;
      if (count === 0) {
        kpiCounter.textContent = '0 KPIs selected';
      } else if (count === 1) {
        kpiCounter.textContent = 'one KPI selected';
      } else {
        kpiCounter.textContent = `${count} KPIs selected`;
      }
    }
  }
  
  /**
   * Initialize file uploads
   */
  function initFileUploads() {
    const dropzones = document.querySelectorAll('.dropzone');
    
    dropzones.forEach(dropzone => {
      // Handle drag and drop events
      ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, function(e) {
          e.preventDefault();
          this.classList.add('dragover');
        });
      });
      
      ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, function(e) {
          e.preventDefault();
          this.classList.remove('dragover');
        });
      });
      
      // Handle file selection
      const fileInput = dropzone.querySelector('input[type="file"]');
      if (!fileInput) return;
      
      fileInput.addEventListener('change', function() {
        const files = Array.from(this.files);
        if (files.length === 0) return;
        
        // Store files in state
        if (dropzone.classList.contains('main-dropzone')) {
          toolState.mainDocuments = files;
        } else {
          toolState.additionalDocuments = files;
        }
        
        // Update UI
        updateFileDisplay(dropzone, files);
      });
    });
    
    // Update comment field
    const commentBox = document.querySelector('.comment-box');
    if (commentBox) {
      commentBox.addEventListener('input', function() {
        toolState.comments = this.value;
      });
    }
  }
  
  /**
   * Update file display in dropzone
   */
  function updateFileDisplay(dropzone, files) {
    const dropzoneText = dropzone.querySelector('p');
    if (!dropzoneText) return;
    
    // Save original text if not already saved
    if (!dropzoneText.getAttribute('data-original-text')) {
      dropzoneText.setAttribute('data-original-text', dropzoneText.textContent);
    }
    
    // Update text to show file count
    if (files.length > 0) {
      dropzoneText.textContent = `${files.length} ${files.length === 1 ? 'Datei' : 'Dateien'} ausgewählt`;
    } else {
      dropzoneText.textContent = dropzoneText.getAttribute('data-original-text');
    }
    
    // Create or update file list
    let fileList = dropzone.querySelector('.file-list');
    if (!fileList) {
      fileList = document.createElement('div');
      fileList.className = 'file-list';
      fileList.style.cssText = 'margin-top: 10px; font-size: 0.85rem; color: #4b5563; text-align: left;';
      dropzone.appendChild(fileList);
    }
    
    fileList.innerHTML = '';
    files.forEach(file => {
      const fileItem = document.createElement('div');
      fileItem.className = 'file-item';
      fileItem.style.cssText = 'padding: 4px 0;';
      fileItem.innerHTML = `<span style="color: #2563eb;">📄</span> ${file.name} (${formatFileSize(file.size)})`;
      fileList.appendChild(fileItem);
    });
  }
  
  /**
   * Format file size in human-readable format
   */
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  /**
   * Initialize navigation buttons
   */
  function initNavigationButtons() {
    // Next buttons
    const nextButtons = document.querySelectorAll('.next-step-button');
    nextButtons.forEach(button => {
      button.addEventListener('click', function() {
        const currentStep = toolState.currentStep;
        if (currentStep === 2) {
          // If on step 3 (upload), submit to backend
          submitToBackend();
        } else {
          // Otherwise move to next step
          goToStep(currentStep + 1);
        }
      });
    });
    
    // Previous buttons
    const prevButtons = document.querySelectorAll('.prev-step-button');
    prevButtons.forEach(button => {
      button.addEventListener('click', function() {
        goToStep(toolState.currentStep - 1);
      });
    });
    
    // Download result button
    const downloadBtn = document.getElementById('downloadResultBtn');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', function() {
      downloadDocxAnalysisResult();
    });
    }
  }
  
  /**
   * Navigate to a specific step
   */
  function goToStep(stepIndex) {
    // Validate step index
    if (stepIndex < 0 || stepIndex > 3) {
      console.error('Invalid step index:', stepIndex);
      return;
    }
    
    console.log('Going to step:', stepIndex);
    
    // Update step indicators
    const stepIndicators = document.querySelectorAll('.step[data-tool-step]');
    stepIndicators.forEach((indicator, index) => {
      indicator.classList.toggle('active', index === stepIndex);
    });
    
    // Show the correct form step
    const formSteps = document.querySelectorAll('.form-step');
    formSteps.forEach((step, index) => {
      step.classList.toggle('active', index === stepIndex);
    });
    
    // Update current step
    toolState.currentStep = stepIndex;
  }
  
  /**
   * Submit data to backend for analysis
   */
  function submitToBackend() {
    console.log('Submitting data to backend...');
    
    const step4 = document.getElementById('step4');
    if (!step4) {
      console.error('Step 4 container not found');
      return;
    }
    
    // Create loading state if not exists
    showLoadingState(step4);
    
    // Prepare payload
    const payload = {
      segment: toolState.segment,
      kpis: Array.from(toolState.kpis),
      comments: toolState.comments,
      mainDocuments: toolState.mainDocuments.map(f => f.name),
      additionalDocuments: toolState.additionalDocuments.map(f => f.name)
    };
    
    console.log('Payload:', payload);
    
    // Send request to API
    fetch('http://localhost:5000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Analysis complete:', data);
      
      if (data.success) {
        // Store results
        toolState.analysisResults = data.result;
        
        // Remove loading state
        removeLoadingState(step4);
        
        // Display results
        displayAnalysisResults(data.result);
        
        // Go to results step
        goToStep(3);
      } else {
        alert('Fehler bei der Analyse: ' + data.message);
      }
    })
    .catch(error => {
      console.error('Error submitting data:', error);
      alert('Fehler: ' + error.message);
      removeLoadingState(step4);
    });
  }
  
  /**
   * Show loading state
   */
  function showLoadingState(container) {
    // Check if loading overlay already exists
    if (container.querySelector('.loading-overlay')) {
      return;
    }
    
    // Create loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255,255,255,0.8); display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 100;';
    
    // Create spinner
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    spinner.style.cssText = 'width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite;';
    
    // Create message
    const message = document.createElement('div');
    message.className = 'loading-message';
    message.style.cssText = 'margin-top: 15px; font-weight: 600; color: #2563eb;';
    message.textContent = 'Die KI generiert Ihre Analyse...';
    
    // Add spinner and message to overlay
    loadingOverlay.appendChild(spinner);
    loadingOverlay.appendChild(message);
    
    // Add animation style if not already added
    if (!document.getElementById('spinner-style')) {
      const style = document.createElement('style');
      style.id = 'spinner-style';
      style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
      document.head.appendChild(style);
    }
    
    // Add overlay to container
    const formBox = container.querySelector('.form-box');
    if (formBox) {
      formBox.style.position = 'relative';
      formBox.appendChild(loadingOverlay);
    } else {
      container.style.position = 'relative';
      container.appendChild(loadingOverlay);
    }
  }
  
  /**
   * Remove loading state
   */
  function removeLoadingState(container) {
    const loadingOverlay = container.querySelector('.loading-overlay');
    if (loadingOverlay) {
      loadingOverlay.remove();
    }
  }
  
  /**
 * Render trend chart using Chart.js
 */
function renderTrendChart(canvas, chartData) {
  if (!canvas || !chartData || !chartData.labels || !chartData.datasets) {
    console.error('Invalid chart data or canvas');
    return;
  }

  // Filter out FY labels
  const filteredIndexes = chartData.labels
    .map((label, i) => ({ label, i }))
    .filter(entry => !entry.label.startsWith('FY'))
    .map(entry => entry.i);

  const filteredLabels = filteredIndexes.map(i => chartData.labels[i]);
  const filteredDatasets = chartData.datasets.map(ds => ({
    ...ds,
    data: filteredIndexes.map(i => ds.data[i]),
    pointRadius: 0,
    pointHoverRadius: 0
  }));

  // Shorten labels: Q1 2023 → Q1 23
  const shortLabels = filteredLabels.map(label => label.replace('202', '2'));

  const hasIfoData = filteredDatasets.length > 1;

  // Apply IFO dataset config
  if (hasIfoData) {
    const ifoDataset = filteredDatasets.find(ds => ds.label.includes('IFO'));
    if (ifoDataset) {
      ifoDataset.yAxisID = 'y1';
      ifoDataset.borderColor = '#34A853';
      ifoDataset.backgroundColor = 'rgba(52, 168, 83, 0.2)';
    }
  }

  // Credit Losses axis range
  const lossDataset = filteredDatasets.find(ds => ds.label.includes('Credit Losses'));
  const lossValues = lossDataset ? lossDataset.data.filter(v => typeof v === 'number') : [];
  const lossMin = Math.floor(Math.min(...lossValues) / 5) * 5;
  const lossMax = Math.ceil(Math.max(...lossValues) / 5) * 5;

  // IFO Index axis range
  let ifoMin = 70;
  let ifoMax = 110;
  if (hasIfoData) {
    const ifoDataset = filteredDatasets.find(ds => ds.label.includes('IFO'));
    const ifoValues = ifoDataset ? ifoDataset.data.filter(v => typeof v === 'number') : [];
    if (ifoValues.length > 0) {
      ifoMin = Math.floor(Math.min(...ifoValues) / 5) * 5;
      ifoMax = Math.ceil(Math.max(...ifoValues) / 5) * 5;
    }
  }

  const ctx = canvas.getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: shortLabels,
      datasets: filteredDatasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: 20,
          bottom: 10
        }
      },
      font: {
        family: "'Inter', sans-serif"
      },      
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        title: {
          display: true,
          text: 'Provision for Credit Losses Over Time',
          font: {
            size: 16,
            weight: 'bold'
          },
          padding: {
            bottom: 40
          }
        },
        legend: {
          display: false
        },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) label += ': ';
              if (context.parsed.y != null) label += context.parsed.y.toFixed(2);
              return label;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#111827',
            maxRotation: 45,
            minRotation: 45
          },
          grid: {
            drawTicks: true,
            drawOnChartArea: true,
            color: (ctx) => {
              const index = ctx.tick?.value;
              const last = shortLabels.length - 1;
              return (index === 0 || index === last) ? 'rgba(0,0,0,0.1)' : 'transparent';
            }
          }
        },
        y: {
          title: {
            display: true,
            text: 'Provision for Credit Losses (bps)',
            color: '#2563eb',
            padding: 10
          },
          ticks: {
            color: '#111827',
            stepSize: 5
          },
          grid: {
            drawTicks: true,
            drawBorder: true,
            color: (ctx) => {
              const value = ctx.tick.value;
              const ticks = ctx.chart.scales.y.ticks;
              return (value === ticks[0].value || value === ticks[ticks.length - 1].value)
                ? 'rgba(0,0,0,0.1)' : 'transparent';
            }
          },
          beginAtZero: false,
          min: lossMin,
          max: lossMax
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'IFO Business Climate Index',
            color: '#34A853',
            padding: 10
          },
          ticks: {
            color: '#111827',
            stepSize: 5
          },
          grid: {
            drawOnChartArea: false,
            drawTicks: true,
            drawBorder: true
          },
          beginAtZero: false,
          min: ifoMin,
          max: ifoMax
        }
      }
    },
    devicePixelRatio: window.devicePixelRatio || 4
  });
}


  /**
 * Display analysis results
 */
function displayAnalysisResults(result) {
  // Get the main analysis container
  const analysisContainer = document.querySelector('.analysis-container');
  
  if (!analysisContainer) {
    console.error('Analysis container not found');
    return;
  }
  
  // Clear existing content
  analysisContainer.innerHTML = '';
  
  // Create and add the variance analysis section
  if (result.variance_analysis) {
    const varianceSection = createAnalysisSection(
      result.variance_analysis.title || 'Variance Analysis',
      result.variance_analysis.content,
      'variance-analysis'
    );
    analysisContainer.appendChild(varianceSection);
  }
  
  // Create and add the trend analysis section with chart
  if (result.trend_analysis) {
    const trendSection = document.createElement('div');
    trendSection.className = 'analysis-section trend-analysis';
    trendSection.style.cssText = 'background: #fff; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;';
    
    // Create header
    const header = document.createElement('div');
    header.className = 'analysis-header';
    header.style.cssText = 'background: #2563eb; color: white; padding: 12px 16px; font-weight: 600; border-radius: 12px 12px 0 0;';
    header.textContent = result.trend_analysis.title || 'Trend Analysis';
    
    // Create content area
    const contentArea = document.createElement('div');
    contentArea.className = 'analysis-content';
    contentArea.style.cssText = 'padding: 16px; line-height: 1.6; text-align: left;';
    
    // Add summary text if available
    if (result.trend_analysis.summary) {
      const summaryText = document.createElement('p');
      summaryText.textContent = result.trend_analysis.summary;
      contentArea.appendChild(summaryText);
    }
    
    // Add chart container if chart data is available
    if (result.chart && result.chart.labels && result.chart.datasets) {
      // Create chart container
      const chartContainer = document.createElement('div');
      chartContainer.style.cssText = 'margin-top: 20px; height: 300px; position: relative;';
      
      // Create canvas for chart
      const canvas = document.createElement('canvas');
      canvas.id = 'trend-chart';
      chartContainer.appendChild(canvas);
      contentArea.appendChild(chartContainer);
      
      // Render chart after DOM update
      setTimeout(() => {
        renderTrendChart(canvas, result.chart);
      }, 100);
    }
    
    // Add to section
    trendSection.appendChild(header);
    trendSection.appendChild(contentArea);
    analysisContainer.appendChild(trendSection);
  }
  
  // Update the explanation text
  const explanationElement = document.querySelector('.analysis-explanation');
  if (explanationElement) {
    explanationElement.textContent = 
      'The AI-powered analysis highlights the key developments and trends for the selected segment. ' +
      'The data was automatically extracted from the available documents and economic indicators.';
  }
}
  
  /**
   * Create a section for displaying analysis content
   */
  function createAnalysisSection(title, content, className) {
    const section = document.createElement('div');
    section.className = `analysis-section ${className}`;
    section.style.cssText = 'background: #fff; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;';
    
    // Create header
    const header = document.createElement('div');
    header.className = 'analysis-header';
    header.style.cssText = 'background: #2563eb; color: white; padding: 12px 16px; font-weight: 600; border-radius: 12px 12px 0 0;';
    header.textContent = title;
    
    // Create content area
    const contentArea = document.createElement('div');
    contentArea.className = 'analysis-content';
    contentArea.style.cssText = 'padding: 16px; max-height: 300px; overflow-y: auto; line-height: 1.6; text-align: left;';
    
    // Format and add the content
    const formattedContent = formatAnalysisText(content);
    contentArea.innerHTML = formattedContent;
    
    // Add to section
    section.appendChild(header);
    section.appendChild(contentArea);
    
    return section;
  }
  
  /**
   * Format analysis text with styling and formatting
   */
  function formatAnalysisText(text) {
    if (!text) return '';
    
    // Replace line breaks with HTML breaks
    let formatted = text.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');
    
    // Wrap in paragraph tags if not already
    if (!formatted.startsWith('<p>')) {
      formatted = '<p>' + formatted;
    }
    if (!formatted.endsWith('</p>')) {
      formatted = formatted + '</p>';
    }
    
    // Bold important metrics and percentages
    formatted = formatted.replace(/(\d+(\.\d+)?%)/g, '<strong>$1</strong>');
    formatted = formatted.replace(/(increased|decreased|grew|declined|rose|fell) by/g, '$1 by <strong>');
    formatted = formatted.replace(/by (\d+(\.\d+)?)/g, 'by $1</strong>');
    
    // Highlight KPI mentions
    const kpiTerms = [
      'NPL', 'LLP', 'RAROC', 'PMI', 'Ifo', 'cost/income', 
      'net interest income', 'allowance for loan losses', 
      'provision for credit losses'
    ];
    
    kpiTerms.forEach(term => {
      const regex = new RegExp(`\\b${term}\\b`, 'g');
      formatted = formatted.replace(regex, `<span style="color: #2563eb; font-weight: 600;">${term}</span>`);
    });
    
    // Add positive/negative indicators
    formatted = formatted.replace(
      /(increase|growth|improvement|positive|higher|better)/gi, 
      '<span style="color: #10b981;">$1</span>'
    );
    
    formatted = formatted.replace(
      /(decrease|decline|deterioration|negative|lower|worse)/gi, 
      '<span style="color: #ef4444;">$1</span>'
    );
    
    return formatted;
  }
  
  /**
   * Download analysis results
   */
  function downloadAnalysisResult() {
    const results = toolState.analysisResults;
    if (!results) {
      console.log('No analysis results available');
      return;
    }
    
    // Create content for download
    const content = `BlueNova Bank Variance Analysis Results
Segment: ${toolState.segment || 'Not selected'}
KPIs: ${Array.from(toolState.kpis).join(', ') || 'None selected'}
Date: ${new Date().toLocaleDateString()}

VARIANCE ANALYSIS:
${results.variance_analysis?.content || ''}

TREND ANALYSIS:
${results.trend_analysis?.summary || results.trend_analysis?.content || ''}
`;
    
    // Create and download file
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'variance-analysis-results.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
/**
 * Download analysis results as DOCX
 * Completely rewritten implementation
 */
async function downloadDocxAnalysisResult() {
  try {
    // Check if docx is available
    if (typeof window.docx === 'undefined') {
      alert('Document generation failed: Required library not loaded. Please refresh the page and try again.');
      return;
    }
    
    const results = toolState.analysisResults;
    if (!results) return;

    // Create document
    const doc = new window.docx.Document({
      sections: [{
        children: [
          new window.docx.Paragraph({
            text: 'BlueNova Bank – Variance Analysis Report',
            heading: window.docx.HeadingLevel.HEADING_1,
            spacing: { after: 300 }
          }),
          new window.docx.Paragraph(`Segment: ${toolState.segment || 'Not selected'}`),
          new window.docx.Paragraph(`KPIs: ${Array.from(toolState.kpis).join(', ') || 'None selected'}`),
          new window.docx.Paragraph(`Date: ${new Date().toLocaleDateString()}`),
          new window.docx.Paragraph({ text: '', spacing: { after: 200 } }),
        ]
      }]
    });

    const children = doc.sections[0].children;

    // Add analysis sections
    if (results.variance_analysis?.content) {
      children.push(
        new window.docx.Paragraph({ text: 'Variance Analysis', heading: window.docx.HeadingLevel.HEADING_2 }),
        new window.docx.Paragraph(results.variance_analysis.content)
      );
    }

    if (results.trend_analysis?.summary || results.trend_analysis?.content) {
      children.push(
        new window.docx.Paragraph({ text: 'Trend Analysis', heading: window.docx.HeadingLevel.HEADING_2 }),
        new window.docx.Paragraph(results.trend_analysis.summary || results.trend_analysis.content)
      );
    }

    // Add chart if available
    const canvas = document.getElementById('trend-chart');
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      const blob = await fetch(dataUrl).then(res => res.blob());
      const buffer = await blob.arrayBuffer();

      children.push(
        new window.docx.Paragraph({ text: '', spacing: { before: 200 } }),
        new window.docx.Paragraph({
          children: [
            new window.docx.ImageRun({
              data: buffer,
              transformation: { width: 600, height: 300 }
            })
          ]
        })
      );
    }

    // Generate and download
    const blob = await window.docx.Packer.toBlob(doc);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'variance-analysis-report.docx';
    a.click();
    URL.revokeObjectURL(a.href);
  } catch (error) {
    console.error('Error generating document:', error);
    alert('Error generating document. Please try again.');
  }
}

  // Add CSS styles for analysis results
  addAnalysisStyles();
  
  /**
   * Add CSS styles for analysis results
   */
  function addAnalysisStyles() {
    // Check if styles are already added
    if (document.getElementById('analysis-styles')) {
      return;
    }
    
    const styleElement = document.createElement('style');
    styleElement.id = 'analysis-styles';
    styleElement.textContent = `
      .analysis-container {
        display: flex;
        flex-direction: column;
        gap: 20px;
        margin: 30px 0;
      }
      
      .analysis-section {
        flex: 1;
        min-width: 0;
        transition: all 0.3s ease;
      }
      
      .analysis-section:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 16px rgba(0,0,0,0.1);
      }
      
      .analysis-content {
        color: #374151;
        font-size: 0.95rem;
      }
      
      .analysis-content p {
        margin-bottom: 12px;
      }
      
      .analysis-content strong {
        color: #111827;
      }
      
      @media (min-width: 768px) {
        .analysis-container {
          flex-direction: row;
        }
      }
    `;
    
    document.head.appendChild(styleElement);
  }
}