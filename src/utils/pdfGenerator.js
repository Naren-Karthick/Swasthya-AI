/**
 * Swasthya AI — Standardized Clinical Triage PDF Export
 * 
 * Code-splitting note: html2pdf.js is imported dynamically so it does not
 * bloat the initial application bundle.
 */

export const generateTriagePDF = async (report, patientInfo) => {
  try {
    const html2pdfModule = await import('html2pdf.js');
    const html2pdf = html2pdfModule.default || html2pdfModule;

    const element = document.createElement('div');
    element.style.width = '210mm'; // Standard A4 width
    element.style.minHeight = '297mm'; // Standard A4 height
    element.style.padding = '20mm';
    element.style.boxSizing = 'border-box';
    element.style.backgroundColor = '#ffffff';
    element.style.fontFamily = 'system-ui, -apple-system, sans-serif';

    const isEmergency = report.isEmergency || report.urgencyLevel === 'EMERGENCY';
    const headerBg = '#0f172a'; // slate-900
    const bannerBg = isEmergency ? '#dc2626' : // red-600
                     report.urgencyLevel === 'MODERATE' ? '#d97706' : // amber-600
                     '#0d9488'; // teal-600

    const statusLabel = isEmergency ? '🚨 CRITICAL MEDICAL EMERGENCY — ACT NOW' :
                        report.urgencyLevel === 'MODERATE' ? '⚠️ MODERATE URGENCY — SEE A CLINICIAN SOON' :
                        'ℹ️ ROUTINE MONITORING — LOW URGENCY';

    element.innerHTML = `
      <table style="width: 100%; background-color: ${headerBg}; border-radius: 8px 8px 0 0; border-bottom: 4px solid ${bannerBg}; border-collapse: collapse;">
        <tr>
          <td style="padding: 20px 24px; vertical-align: middle; text-align: left;">
            <h1 style="margin: 0; font-size: 22px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">Swasthya AI</h1>
            <p style="margin: 4px 0 0 0; font-size: 11px; color: #94a3b8; font-weight: bold;">Standardized Clinical Triage & Urgency Summary</p>
          </td>
          <td style="padding: 20px 24px; vertical-align: middle; text-align: right; font-size: 10px; color: #cbd5e1; line-height: 1.5;">
            <div><strong>Patient Session ID:</strong> ${patientInfo.id || 'N/A'}</div>
            <div><strong>Generated:</strong> ${new Date(patientInfo.date || Date.now()).toLocaleString()}</div>
            <div><strong>Mode:</strong> Anonymous Triage Intake</div>
          </td>
        </tr>
      </table>

      <!-- Patient & Session Context -->
      <div style="margin-top: 24px;">
        <h3 style="margin: 0 0 8px 0; font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">
          1. Patient Demographics & Intake Context
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 8px;">
          <tr>
            <td style="padding: 5px 0; color: #475569; width: 25%;"><strong>Age Bracket:</strong></td>
            <td style="padding: 5px 0; color: #0f172a;">${patientInfo.ageGroup || 'General Population'}</td>
            <td style="padding: 5px 0; color: #475569; width: 25%;"><strong>Symptom Duration:</strong></td>
            <td style="padding: 5px 0; color: #0f172a;">${patientInfo.duration ? `${patientInfo.duration} days` : 'Acute'}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #475569;"><strong>Language Mode:</strong></td>
            <td style="padding: 5px 0; color: #0f172a;">${patientInfo.language || 'English'}</td>
            <td style="padding: 5px 0; color: #475569;"><strong>Discomfort Level:</strong></td>
            <td style="padding: 5px 0; color: #0f172a;">${patientInfo.severity ? `${patientInfo.severity}/10` : 'Not rated'}</td>
          </tr>
        </table>
        
        <div style="margin-top: 12px; padding: 12px; background-color: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;">
          <strong style="font-size: 11px; color: #475569; display: block; margin-bottom: 4px; text-transform: uppercase;">Reported Symptoms (Patient Narrative):</strong>
          <p style="margin: 0; font-size: 12px; color: #1e293b; line-height: 1.5; white-space: pre-wrap; font-weight: 600;">"${patientInfo.symptoms || 'None reported.'}"</p>
        </div>
      </div>

      <!-- Urgency Classification Banner -->
      <div style="margin-top: 20px; background-color: ${bannerBg}; color: #ffffff; padding: 14px; border-radius: 6px; font-weight: 900; font-size: 13px; text-align: center; letter-spacing: 0.5px;">
        ${statusLabel}
      </div>

      <!-- Clinical Analysis & Triage Details -->
      <div style="margin-top: 24px;">
        <h3 style="margin: 0 0 8px 0; font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">
          2. Algorithmic Clinical Assessment & Observations
        </h3>
        
        <div style="margin-top: 12px;">
          <strong style="font-size: 11px; color: #475569; display: block; margin-bottom: 4px; text-transform: uppercase;">Primary Clinical Assessment:</strong>
          <div style="font-size: 12px; color: #0f172a; line-height: 1.5; background-color: #f8fafc; padding: 12px; border-radius: 6px; border-left: 4px solid #0d9488; font-weight: 500;">
            ${report.primaryAssessment}
          </div>
        </div>

        <!-- Recommended Timeframe -->
        <div style="margin-top: 14px;">
          <strong style="font-size: 11px; color: #475569; display: block; margin-bottom: 4px; text-transform: uppercase;">Recommended Consultation Timeframe:</strong>
          <div style="font-size: 12px; font-weight: bold; color: #0f172a;">
            ${report.recommendedTimeframe || (isEmergency ? 'Immediate Emergency Care' : 'Within 24 to 48 hours')}
          </div>
        </div>

        <!-- Clinical Terminology -->
        <div style="margin-top: 16px;">
          <strong style="font-size: 11px; color: #475569; display: block; margin-bottom: 6px; text-transform: uppercase;">Standardized Medical Terms for Attending Physician:</strong>
          <div style="margin-top: 4px;">
            ${report.clinicalTerms && report.clinicalTerms.length > 0 
              ? report.clinicalTerms.map(term => `
                  <span style="background-color: #f1f5f9; border: 1px solid #cbd5e1; color: #0f172a; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; display: inline-block; margin-right: 6px; margin-bottom: 6px;">
                    ${term}
                  </span>
                `).join('')
              : '<span style="font-size: 11px; color: #94a3b8;">None identified</span>'
            }
          </div>
        </div>

        <!-- Recommended Actions -->
        <div style="margin-top: 18px; padding: 14px; background-color: ${isEmergency ? '#fff1f2' : '#f0fdfa'}; border: 1px solid ${isEmergency ? '#fecdd3' : '#ccfbf1'}; border-radius: 6px;">
          <strong style="font-size: 11px; color: ${isEmergency ? '#9f1239' : '#115e59'}; display: block; margin-bottom: 4px; text-transform: uppercase;">Actionable Directive:</strong>
          <p style="margin: 0; font-size: 12px; color: ${isEmergency ? '#9f1239' : '#115e59'}; font-weight: 800; line-height: 1.5;">
            👉 ${report.recommendedAction}
          </p>
        </div>
      </div>

      <!-- Medical Safety Disclaimer -->
      <div style="margin-top: 36px; padding: 12px; border: 1px solid #fecdd3; background-color: #fff1f2; border-radius: 6px; font-size: 10px; line-height: 1.5; color: #9f1239;">
        <strong style="display: block; margin-bottom: 2px; font-size: 11px;">⚠️ MEDICAL NOTICE & PROTOTYPE BOUNDARIES:</strong>
        This document is generated by Swasthya AI, an informational symptom triage prototype. It does not establish a doctor-patient relationship and is NOT a medical diagnosis or prescription. If symptoms are severe, worsening, or life-threatening, do not wait for this tool. Contact emergency services (108 / 112) immediately.
      </div>
    `;

    const opt = {
      margin: 0,
      filename: `SwasthyaAI-Triage-${patientInfo.id || 'Summary'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    await html2pdf().set(opt).from(element).save();
  } catch (err) {
    console.error('PDF Generation Error:', err);
    alert('Unable to generate PDF. Please try copying the text summary instead.');
  }
};
