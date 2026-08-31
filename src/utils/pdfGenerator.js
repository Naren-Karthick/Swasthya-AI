import html2pdf from 'html2pdf.js';

export const generateTriagePDF = (report, patientInfo) => {
  const element = document.createElement('div');
  element.style.width = '210mm'; // Exact A4 width
  element.style.minHeight = '297mm'; // Exact A4 height
  element.style.padding = '20mm'; // Perfect margins inside container
  element.style.boxSizing = 'border-box';
  element.style.backgroundColor = '#ffffff';
  element.style.fontFamily = 'system-ui, -apple-system, sans-serif';

  // Urgency colors
  const isEmergency = report.isEmergency || report.urgencyLevel === 'EMERGENCY';
  const headerBg = '#0f172a'; // slate-900
  const bannerBg = isEmergency ? '#e11d48' : // rose-600
                   report.urgencyLevel === 'MODERATE' ? '#0d9488' : // teal-600
                   '#3b82f6'; // blue-500

  const statusLabel = report.urgencyLevel === 'EMERGENCY' ? '🚨 CRITICAL MEDICAL EMERGENCY' :
                      report.urgencyLevel === 'MODERATE' ? '⚠️ MODERATE / CLINICAL REVIEW REQUIRED' :
                      'ℹ️ LOW URGENCY / SELF-MONITORING';

  // Structure layout using proper tables with cell padding (avoid invalid table padding)
  element.innerHTML = `
    <!-- Header table with correct padding inside cells -->
    <table style="width: 100%; background-color: ${headerBg}; border-radius: 8px 8px 0 0; border-bottom: 4px solid ${bannerBg}; border-collapse: collapse;">
      <tr>
        <td style="padding: 20px 24px; vertical-align: middle; text-align: left;">
          <h1 style="margin: 0; font-size: 22px; font-weight: bold; color: #ffffff; letter-spacing: -0.5px;">SwasthyaAI</h1>
          <p style="margin: 4px 0 0 0; font-size: 11px; color: #94a3b8;">Clinical Triage & Intelligent Referral Assistant</p>
        </td>
        <td style="padding: 20px 24px; vertical-align: middle; text-align: right; font-size: 10px; color: #cbd5e1; line-height: 1.5;">
          <div><strong>Patient Session ID:</strong> ${patientInfo.id || 'N/A'}</div>
          <div><strong>Generated:</strong> ${new Date(patientInfo.date || Date.now()).toLocaleString()}</div>
        </td>
      </tr>
    </table>

    <!-- Patient Context Section -->
    <div style="margin-top: 24px;">
      <h3 style="margin: 0 0 8px 0; font-size: 13px; font-weight: bold; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
        1. Patient & Session Context
      </h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 8px;">
        <tr>
          <td style="padding: 5px 0; color: #475569; width: 25%;"><strong>Patient Name:</strong></td>
          <td style="padding: 5px 0; color: #0f172a;">${patientInfo.name || 'Anonymous Patient'}</td>
          <td style="padding: 5px 0; color: #475569; width: 25%;"><strong>Age Group:</strong></td>
          <td style="padding: 5px 0; color: #0f172a;">${patientInfo.ageGroup || 'Not specified'}</td>
        </tr>
        <tr>
          <td style="padding: 5px 0; color: #475569;"><strong>Symptom Duration:</strong></td>
          <td style="padding: 5px 0; color: #0f172a;">${patientInfo.duration ? `${patientInfo.duration} days` : 'Not specified'}</td>
          <td style="padding: 5px 0; color: #475569;"><strong>Language Mode:</strong></td>
          <td style="padding: 5px 0; color: #0f172a;">${patientInfo.language || 'English'}</td>
        </tr>
      </table>
      
      <div style="margin-top: 12px; padding: 12px; background-color: #f8fafc; border-radius: 6px; border: 1px solid #f1f5f9;">
        <strong style="font-size: 11px; color: #475569; display: block; margin-bottom: 4px;">Reported Symptoms:</strong>
        <p style="margin: 0; font-size: 12px; color: #334155; line-height: 1.5; white-space: pre-wrap;">${patientInfo.symptoms || 'None reported.'}</p>
      </div>
    </div>

    <!-- Urgency Status Banner -->
    <div style="margin-top: 24px; background-color: ${bannerBg}; color: #ffffff; padding: 14px; border-radius: 6px; font-weight: bold; font-size: 13px; text-align: center; letter-spacing: 0.5px;">
      ${statusLabel}
    </div>

    <!-- Clinical Details -->
    <div style="margin-top: 24px;">
      <h3 style="margin: 0 0 8px 0; font-size: 13px; font-weight: bold; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
        2. Clinical Analysis Details
      </h3>
      
      <!-- Primary Assessment -->
      <div style="margin-top: 12px;">
        <strong style="font-size: 11px; color: #475569; display: block; margin-bottom: 4px;">Primary Clinical Assessment:</strong>
        <div style="font-size: 12px; color: #334155; line-height: 1.5; background-color: #f8fafc; padding: 12px; border-radius: 6px; border-left: 4px solid #cbd5e1;">
          ${report.primaryAssessment}
        </div>
      </div>

      <!-- Clinical Terminology -->
      <div style="margin-top: 16px;">
        <strong style="font-size: 11px; color: #475569; display: block; margin-bottom: 6px;">Identified Clinical Terminology:</strong>
        <div style="margin-top: 6px;">
          ${report.clinicalTerms && report.clinicalTerms.length > 0 
            ? report.clinicalTerms.map(term => `
                <span style="background-color: #f1f5f9; border: 1px solid #e2e8f0; color: #1e293b; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; display: inline-block; margin-right: 6px; margin-bottom: 6px;">
                  ${term}
                </span>
              `).join('')
            : '<span style="font-size: 11px; color: #94a3b8;">None identified</span>'
          }
        </div>
      </div>

      <!-- Contributing Factors -->
      <div style="margin-top: 16px;">
        <strong style="font-size: 11px; color: #475569; display: block; margin-bottom: 6px;">Potential Contributing Factors:</strong>
        <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #334155; line-height: 1.5;">
          ${report.contributingFactors && report.contributingFactors.length > 0
            ? report.contributingFactors.map(f => `<li style="margin-bottom: 4px;">${f}</li>`).join('')
            : '<li>None identified</li>'
          }
        </ul>
      </div>

      <!-- Recommended Action -->
      <div style="margin-top: 18px; padding: 12px; background-color: ${isEmergency ? '#fff5f5' : '#f0fdf4'}; border: 1px solid ${isEmergency ? '#fee2e2' : '#dcfce7'}; border-radius: 6px;">
        <strong style="font-size: 11px; color: ${isEmergency ? '#991b1b' : '#166534'}; display: block; margin-bottom: 4px;">Recommended Actions & Care Plan:</strong>
        <p style="margin: 0; font-size: 12px; color: ${isEmergency ? '#991b1b' : '#166534'}; font-weight: bold; line-height: 1.5;">
          ${report.recommendedAction}
        </p>
      </div>
    </div>

    <!-- Safety Disclaimer -->
    <div style="margin-top: 36px; padding: 12px; border: 1px solid #fee2e2; background-color: #fff5f5; border-radius: 6px; font-size: 10px; line-height: 1.5; color: #991b1b;">
      <strong style="display: block; margin-bottom: 2px; font-size: 10px;">⚠️ CRITICAL SAFETY NOTICE & DISCLAIMER:</strong>
      This document is generated by SwasthyaAI, an educational AI triage engine. It is not a replacement for a professional medical consultation, diagnostic test, or emergency medical services. If you are experiencing symptoms of a severe or life-threatening condition (e.g., chest pains, severe breathing problems), seek immediate emergency care.
    </div>
  `;

  const opt = {
    margin: 0, // No margins on PDF since we apply perfect margins in A4 document coordinates
    filename: `SwasthyaAI-Report-${patientInfo.id || 'Assessment'}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf()
    .set(opt)
    .from(element)
    .save()
    .catch((err) => {
      console.error('PDF Generation Error:', err);
    });
};
