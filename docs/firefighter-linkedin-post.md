# LinkedIn Portfolio Post — Palm92 Firefighter Review Copilot

I have been exploring how software testing, GRC and AI governance can work together in a practical enterprise scenario.

The result is a new portfolio module inside **Palm92 AI Test Copilot**: **Palm92 Firefighter Review Copilot**.

The scenario is based on SAP GRC Firefighter-style emergency privileged access. A user may need elevated access urgently, but the control does not end when access is granted. The organisation still needs to know why access was used, what actions were performed, whether activity remained within the approved scope and time window, whether supporting evidence exists, and whether an independent Controller reviewed the session.

My demo turns that lifecycle into a governed testing and review workflow:

**Emergency Access → Firefighter Log → Control Analysis → Risk Findings → Controller Questions → Evidence Review → Human Decision → Audit Trail**

The build includes eight explainable control rules, six synthetic emergency-access sessions, 18 mapped software test cases, requirement-to-test traceability, audit evidence, segregation-of-duties checks, and a human confirmation gate for final review completion.

One scenario is deliberately interesting: the approved purpose is payment recovery, but a privileged user-administration action appears in the session. The system does not automatically accuse the user of wrongdoing. It identifies the mismatch, shows the evidence, and drafts a neutral Controller question asking why the action was necessary and what evidence supports it.

That distinction matters to me.

AI should help investigators and testers find what deserves attention. It should not quietly turn an anomaly into a verdict.

**AI investigates. Humans decide.**

This is an independent educational portfolio project using synthetic data only. It has no live SAP connection and is not affiliated with SAP.

Source: https://github.com/faithfulord1/Palm92-ai-test-copilot

#SoftwareTesting #SAPGRC #GRC #AIGovernance #CyberSecurity #QualityAssurance #IAM #PrivilegedAccess #ResponsibleAI #Palm92Intelligence
