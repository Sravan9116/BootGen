// SENTINEL Multilingual Localization Support (i18n)
// Exposes translation functions and dynamically injects language dropdown selector.

const SENTINEL_TRANSLATIONS = {
    en: {
        "world_feed": "📰 World Feed",
        "world_chat": "💬 World Chat",
        "my_dashboard": "📊 My Dashboard",
        "report_incident": "✍️ Report Incident",
        "fact_checker": "🔍 Fact Checker",
        "government_portal": "🏛️ Government Admin Portal",
        "citizen_account": "Citizen Account",
        "control_room": "🎛️ Control Room",
        "verification_room": "🔍 Verification Room",
        "department_board": "📋 Department Board",
        "alert_dispatch": "🚨 Alert Dispatch",
        "emergency_map": "🗺️ Emergency Map",
        "logout": "🚪 Logout",
        
        "cta_title": "Secure Your Community Today",
        "cta_desc": "Access real-time feeds, report incidents, and stay informed with official government-backed truth. Stop rumors. Stop chaos.",
        "enter_platform": "Enter Platform",
        "landing_subtitle": "Real-Time Government Verified Social Intelligence Platform",
        "stat_ai_time": "AI Ingestion Time",
        "stat_routing_acc": "Routing Accuracy",
        "stat_alerts_disp": "Alerts Dispatched",
        "stat_verified_auth": "Verified Authenticity",
        
        "login_title": "Official Access Portal",
        "login_desc": "Secure authentication for authorized disaster coordinators and verification officers.",
        "email_label": "Email Address",
        "password_label": "Password",
        "signin_btn": "Sign In to Command",
        
        "share_claim_title": "Share a Claim or Incident Report",
        "post_report_btn": "Post Report",
        "ollama_active": "Ollama Cloud Engine: Active",
        "feed_subtitle": "Real-time crowdsourced reports and official clarifications.",
        "filter_category": "Filter by Category",
        "all_categories": "All Categories",
        
        "report_submit_title": "Submit an Incident Report",
        "report_details_title": "Report Details",
        "incident_title_label": "Incident Title",
        "category_label": "Category",
        "location_label": "Location / Region",
        "severity_label": "Severity Level",
        "description_label": "Describe the Incident",
        "submit_report_btn": "Submit Official Report",
        
        "factcheck_title": "Official Truth vs Rumor Index",
        "factcheck_desc": "Verify community statements, check official clarifications, and view authenticity tags.",
        "search_placeholder": "Search Rumors or Topics",
        
        "alert_dispatch_title": "Targeted Alert Dispatch",
        "dispatch_title": "Dispatch Geo-Targeted Emergency Alerts",
        "radius_label": "Radius (km)",
        "warning_msg_label": "Warning Message",
        "channels_label": "Select Channels",
        "fire_alert_btn": "FIRE GEO-TARGETED ALERT",
        
        // Critical alerts & Policy Sidebar Extensions
        "critical_broadcasts_title": "🚨 Critical Broadcasts",
        "trust_policy_title": "🛡️ Sentinel Trust Policy",
        "trust_policy_desc_1": "Every claim undergoes instant **AI pre-classification** to determine urgency and route it to the respective government branch.",
        "trust_policy_desc_2": "**Important:** AI marks are suggestions. Complete verification requires official department responses.",
        "no_emergencies_msg": "No active critical emergencies.",
        "location_prefix": "Location",
        "alert_suffix": "ALERT",
        "official_clarification_prefix": "Official Clarification",
        "no_posts_msg": "No posts available on the feed.",
        
        // Departments & alert types
        "water_department": "Water Department",
        "traffic_department": "Traffic Department",
        "weather_department": "Weather Department",
        "disaster_management": "Disaster Management",
        "police__public_safety": "Police / Public Safety",
        "electricity_department": "Electricity Department",
        "other_departments": "Other Departments",
        "emergency": "Emergency",
        "flood": "Flood",
        "weather": "Weather",
        "traffic": "Traffic",
        "general": "General",
        "emergency_alert_prefix": "EMERGENCY ALERT",
        "target_prefix": "Target",
        "public_claim_prefix": "Public Claim",
        "status_update_suffix": "Status Update",
        "pending_verification": "Pending verification review.",
        "government_authority": "Government Authority",
        "no_bulletins_msg": "No matching bulletins found."
    },
    hi: {
        "world_feed": "📰 विश्व फ़ीड",
        "world_chat": "💬 विश्व चैट",
        "my_dashboard": "📊 मेरा डैशबोर्ड",
        "report_incident": "✍️ घटना की रिपोर्ट करें",
        "fact_checker": "🔍 तथ्य जाँचकर्ता",
        "government_portal": "🏛️ सरकारी एडमिन पोर्टल",
        "citizen_account": "नागरिक खाता",
        "control_room": "🎛️ नियंत्रण कक्ष",
        "verification_room": "🔍 सत्यापन कक्ष",
        "department_board": "📋 विभाग बोर्ड",
        "alert_dispatch": "🚨 अलर्ट प्रेषण",
        "emergency_map": "🗺️ आपातकालीन मानचित्र",
        "logout": "🚪 लॉगआउट",
        
        "cta_title": "आज ही अपने समुदाय को सुरक्षित करें",
        "cta_desc": "वास्तविक समय के फ़ीड तक पहुँचें, घटनाओं की रिपोर्ट करें और आधिकारिक सरकारी-समर्थित सत्य के साथ सूचित रहें। अफवाहें रोकें। अराजकता रोकें।",
        "enter_platform": "प्लेटफ़ॉर्म में प्रवेश करें",
        "landing_subtitle": "वास्तविक समय सरकारी सत्यापित सामाजिक खुफिया प्लेटफ़ॉर्म",
        "stat_ai_time": "एआई अंतर्ग्रहण समय",
        "stat_routing_acc": "रूटिंग सटीकता",
        "stat_alerts_disp": "प्रेषित अलर्ट",
        "stat_verified_auth": "सत्यापित प्रामाणिकता",
        
        "login_title": "आधिकारिक पहुँच पोर्टल",
        "login_desc": "अधिकृत आपदा समन्वयकों और सत्यापन अधिकारियों के लिए सुरक्षित प्रमाणीकरण।",
        "email_label": "ईमेल पता",
        "password_label": "पासवर्ड",
        "signin_btn": "कमांड में लॉग इन करें",
        
        "share_claim_title": "दावा या घटना रिपोर्ट साझा करें",
        "post_report_btn": "रिपोर्ट पोस्ट करें",
        "ollama_active": "ओलामा क्लाउड इंजन: सक्रिय",
        "feed_subtitle": "वास्तविक समय के क्राउडसोर्स किए गए रिपोर्ट और आधिकारिक स्पष्टीकरण।",
        "filter_category": "श्रेणी के अनुसार फ़िल्टर करें",
        "all_categories": "सभी श्रेणियां",
        
        "report_submit_title": "घटना की रिपोर्ट सबमिट करें",
        "report_details_title": "रिपोर्ट विवरण",
        "incident_title_label": "घटना का शीर्षक",
        "category_label": "श्रेणी",
        "location_label": "स्थान / क्षेत्र",
        "severity_label": "गंभीरता स्तर",
        "description_label": "घटना का वर्णन करें",
        "submit_report_btn": "आधिकारिक रिपोर्ट सबमिट करें",
        
        "factcheck_title": "आधिकारिक सत्य बनाम अफवाह सूचकांक",
        "factcheck_desc": "सामुदायिक बयानों को सत्यापित करें, आधिकारिक स्पष्टीकरण देखें और प्रामाणिकता टैग देखें।",
        "search_placeholder": "अफवाहें या विषय खोजें",
        
        "alert_dispatch_title": "लक्षित अलर्ट प्रेषण",
        "dispatch_title": "भू-लक्षित आपातकालीन अलर्ट भेजें",
        "radius_label": "त्रिज्या (किमी)",
        "warning_msg_label": "चेतावनी संदेश",
        "channels_label": "चैनलों का चयन करें",
        "fire_alert_btn": "भू-लक्षित अलर्ट भेजें",
        
        // Critical alerts & Policy Sidebar Extensions
        "critical_broadcasts_title": "🚨 गंभीर प्रसारण",
        "trust_policy_title": "🛡️ सेंटिनल ट्रस्ट नीति",
        "trust_policy_desc_1": "हर दावे का तात्कालिक **एआई पूर्व-वर्गीकरण** होता है ताकि गंभीरता निर्धारित की जा सके और इसे संबंधित सरकारी विभाग को भेजा जा सके।",
        "trust_policy_desc_2": "**महत्वपूर्ण:** एआई चिह्न केवल सुझाव हैं। पूर्ण सत्यापन के लिए आधिकारिक विभाग की प्रतिक्रियाएं आवश्यक हैं।",
        "no_emergencies_msg": "कोई सक्रिय आपात स्थिति नहीं है।",
        "location_prefix": "स्थान",
        "alert_suffix": "चेतावनी",
        "official_clarification_prefix": "आधिकारिक स्पष्टीकरण",
        "no_posts_msg": "फ़ीड पर कोई पोस्ट उपलब्ध नहीं है।",
        
        // Departments & alert types
        "water_department": "जल विभाग",
        "traffic_department": "यातायात विभाग",
        "weather_department": "मौसम विभाग",
        "disaster_management": "आपदा प्रबंधन",
        "police__public_safety": "पुलिस / सार्वजनिक सुरक्षा",
        "electricity_department": "बिजली विभाग",
        "other_departments": "अन्य विभाग",
        "emergency": "आपातकाल",
        "flood": "बाढ़",
        "weather": "मौसम",
        "traffic": "यातायात",
        "general": "सामान्य",
        "emergency_alert_prefix": "आपातकालीन चेतावनी",
        "target_prefix": "लक्ष्य",
        "public_claim_prefix": "सार्वजनिक दावा",
        "status_update_suffix": "स्थिति अपडेट",
        "pending_verification": "सत्यापन समीक्षा लंबित है।",
        "government_authority": "सरकारी प्राधिकरण",
        "no_bulletins_msg": "कोई मेल खाने वाला बुलेटिन नहीं मिला।"
    },
    te: {
        "world_feed": "📰 ప్రపంచ ఫీడ్",
        "world_chat": "💬 ప్రపంచ చాట్",
        "my_dashboard": "📊 నా డాష్‌బోర్డ్",
        "report_incident": "✍️ సంఘటనను నివేదించండి",
        "fact_checker": "🔍 ఫాక్ట్ చెకర్",
        "government_portal": "🏛️ ప్రభుత్వ అడ్మిన్ పోర్టల్",
        "citizen_account": "పౌర ఖాతా",
        "control_room": "🎛️ నియంత్రణ గది",
        "verification_room": "🔍 ధృవీకరణ గది",
        "department_board": "📋 విభాగం బోర్డు",
        "alert_dispatch": "🚨 అలర్ట్ డిస్పాచ్",
        "emergency_map": "🗺️ అత్యవసర పటం",
        "logout": "🚪 లాగ్ అవుట్",
        
        "cta_title": "ఈరోజే మీ సమాజాన్ని సురక్షితం చేసుకోండి",
        "cta_desc": "నిజ-సమయ ఫీడ్‌లను యాక్సెస్ చేయండి, సంఘటనలను నివేదించండి మరియు అధికారిక ప్రభుత్వ సత్యంతో సమాచారం పొందండి. అపోహలను ఆపండి. గందరగోళాన్ని నివారించండి.",
        "enter_platform": "ప్లాట్‌ఫారమ్‌లోకి ప్రవేశించండి",
        "landing_subtitle": "నిజ-సమయ ప్రభుత్వ ధృవీకృత సామాజిక ఇంటెలిజెన్స్ ప్లాట్‌ఫారమ్",
        "stat_ai_time": "AI ఇన్‌జెషన్ సమయం",
        "stat_routing_acc": "रౌటింగ్ ఖచ్చితత్వం",
        "stat_alerts_disp": "పంపిణీ చేసిన అలర్ట్లు",
        "stat_verified_auth": "ధృవీకరించబడిన ప్రామాణికత",
        
        "login_title": "అధికారిక యాక్సెస్ పోర్టల్",
        "login_desc": "అధికారిక విపత్తు సమన్വయకర్తలు మరియు ధృవీకరణ అధికారుల కోసం సురక్షిత లాగిన్.",
        "email_label": "ఇమెయిల్ చిరునామా",
        "password_label": "పాస్‌వర్డ్",
        "signin_btn": "కమాండ్‌లోకి లాగిన్ అవ్వండి",
        
        "share_claim_title": "క్లెయిమ్ లేదా సంఘటన నివేదికను పంచుకోండి",
        "post_report_btn": "నివేదికను పోస్ట్ చేయి",
        "ollama_active": "ఓల్లామా క్లൗడ్ ఇంజిన్: యాക്టివ్",
        "feed_subtitle": "రియల్ టైమ్ క్రౌడ్‌సోర్స్డ్ నివేదికలు మరియు అధికారిక వివరణలు.",
        "filter_category": "వర్గం ద్వారా ఫిల్టర్ చేయండి",
        "all_categories": "అన్ని వర్గాలు",
        
        "report_submit_title": "సంఘటన నిവേదికను సమర్పించండి",
        "report_details_title": "నివేదిక వివరాలు",
        "incident_title_label": "సంఘటన శీర్షిక",
        "category_label": "వర్గం",
        "location_label": "స్థానము / ప్రాంతం",
        "severity_label": "తీవ్రత స్థాయి",
        "description_label": "సంఘటనను వివరించండి",
        "submit_report_btn": "అధికారిక నిവേదికను సమర్పించండి",
        
        "factcheck_title": "అధికారిక నిజం వర్సెస్ అపోహల సూచిక",
        "factcheck_desc": "కమ్యూనిటీ ప్రకటనలను ధൃవీకరించండి, అధికారిక వివరణలను మరియు ప్రాമാణికత ట్యాగ్‌లను తనిഖీ చేయండి.",
        "search_placeholder": "అపోహలు లేదా అంశాల కోసం వెతకండి",
        
        "alert_dispatch_title": "లక్ష్యిత అలర్ట్ డిస్పాచ్",
        "dispatch_title": "భౌగోళిక లక్ష్యిత అత్యవసర అలర్ట్‌లను పంపండి",
        "radius_label": "వ్యాసార్థం (కిమీ)",
        "warning_msg_label": "హెచ్చరిక సందేశం",
        "channels_label": "ఛానెల్‌లను ఎంచుకోండి",
        "fire_alert_btn": "లక్ష్యిత అలర్ట్‌ను పంపండి",
        
        // Critical alerts & Policy Sidebar Extensions
        "critical_broadcasts_title": "🚨 క్లిష్టమైన ప్రసారాలు",
        "trust_policy_title": "🛡️ సెంటినెల్ విశ్వసనీయ విధానం",
        "trust_policy_desc_1": "ప్రతి నివేదిక అత్యవసర స్థాయిని గుర్తించడానికి మరియు సంబంధిత ప్రభుత్వ విభాగానికి పంపడానికి తక్షణమే **AI వర్గీకరణ** చేయబడుతుంది.",
        "trust_policy_desc_2": "**ముఖ్య గమనిక:** AI గుర్తులు కేవలం సూచనలు మాత్రమే. పూర్తి ధృవీకరణకు అధికారిక శాఖ ప్రతిస్పందనలు తప్పనిసరి.",
        "no_emergencies_msg": "క్రియాశీల అత్యవసర పరిస్థితులు ఏవీ లేవు.",
        "location_prefix": "స్థానము",
        "alert_suffix": "హెచ్చరిక",
        "official_clarification_prefix": "అధికారిక వివరణ",
        "no_posts_msg": "ఫీడ్‌లో పోస్ట్‌లు ఏవీ లేవు.",
        
        // Departments & alert types
        "water_department": "నీటి శాఖ",
        "traffic_department": "ట్రాఫిక్ శాఖ",
        "weather_department": "వాతావరణ శాఖ",
        "disaster_management": "విపత్తు నిర్వహణ",
        "police__public_safety": "పోలీస్ / ప్రజా రక్షణ",
        "electricity_department": "విద్యుత్ శాఖ",
        "other_departments": "ఇతర విభాగాలు",
        "emergency": "అత్యవసర పరిస్థితి",
        "flood": "వరద",
        "weather": "వాతావరణం",
        "traffic": "ట్రాఫిక్",
        "general": "సాధారణ",
        "emergency_alert_prefix": "అత్యవసర హెచ్చరిక",
        "target_prefix": "లక్ష్యం",
        "public_claim_prefix": "ప్రజా నివేదిక",
        "status_update_suffix": "స్థితి నవీకరణ",
        "pending_verification": "ధృవీకరణ సమీక్ష పెండింగ్‌లో ఉంది.",
        "government_authority": "ప్రభుత్వ అధికారం",
        "no_bulletins_msg": "సరిపోలే బులెటిన్లు ఏవీ కనుగొనబడలేదు."
    },
    ta: {
        "world_feed": "📰 உலக ஊட்டம்",
        "world_chat": "💬 உலக அரட்டை",
        "my_dashboard": "📊 என் டாஷ்போர்டு",
        "report_incident": "✍️ சம்பவத்தைப் புகாரளி",
        "fact_checker": "🔍 உண்மை சரிபார்ப்பாளர்",
        "government_portal": "🏛️ அரசு நிர்வாக போர்டல்",
        "citizen_account": "குடிமகன் கணக்கு",
        "control_room": "🎛️ கட்டுப்பாட்டு அறை",
        "verification_room": "🔍 சரிபார்ப்பு அறை",
        "department_board": "📋 துறை வாரியம்",
        "alert_dispatch": "🚨 எச்சரிக்கை அனுப்புதல்",
        "emergency_map": "🗺️ அவசர வரைபடம்",
        "logout": "🚪 logout",
        
        "cta_title": "இன்று உங்கள் சமூகத்தைப் பாதுகாக்கவும்",
        "cta_desc": "உண்மையான நேர ஊடகம், சம்பவங்களை புகாரளித்தல் மற்றும் அரசாங்கத்தின் அதிகாரப்பூர்വ உண்மையுடன் தகவலறிந்து இருங்கள். வதந்திகளை நிறுத்துங்கள். குழப்பங்களைத் தவிர்க்கவும்.",
        "enter_platform": "தளத்திற்குள் நுழையவும்",
        "landing_subtitle": "உண்மையான நேர அரசாங்கத்தால் சரிபார்க்கப்பட்ட சமூக புலனாய்வு தளம்",
        "stat_ai_time": "AI உദ്ധானம் நேரம்",
        "stat_routing_acc": "ரூட்டிங் துல்லியம்",
        "stat_alerts_disp": "அனுப்பப்பட்ட எச்சரிக்கைகள்",
        "stat_verified_auth": "சரிபார்க்கப்பட்ட நம்பகத்தன்மை",
        
        "login_title": "அதிகாரப்பூர்வ அணுகல் போர்டல்",
        "login_desc": "அங்கீகரிக்கப்பட்ட பேരിடர் ஒருங்கிணைப்பாளர்கள் மற்றும் சரிபார்ப்பு அதிகாரிகளுக்கான பாதுகாப்பான உள்நுழைவு.",
        "email_label": "மின்னஞ்சல் முகவரி",
        "password_label": "கடவுச்சൊൽ",
        "signin_btn": "உள்நுழையவும்",
        
        "share_claim_title": "ஒரு கூற்று அல்லது சம்பவ அறிக்கையைப் பகிரவும்",
        "post_report_btn": "பதிவிடவும்",
        "ollama_active": "Ollama கிளவுட் என்ஜின்: செயலில் உள்ளது",
        "feed_subtitle": "உண்மையான நேர கூட்ட ஆதார அறிக்கைகள் மற்றும் அதிகாரப்பூர்வ விளக்கங்கள்.",
        "filter_category": "வகை வாரியாக வடிகட்டவும்",
        "all_categories": "அனைத்து பிரிவுகள்",
        
        "report_submit_title": "சம்பவ அறிக்கையைச் சமர்ப்பிக்கவும்",
        "report_details_title": "அறிக்கை விவரங்கள்",
        "incident_title_label": "சம்பவத் தலைப்பு",
        "category_label": "வகை",
        "location_label": "இருப்பிடம் / பகுதி",
        "severity_label": "தீவிரத்தன்மை நிலை",
        "description_label": "சம்பவத்தை விவரிக்கவும்",
        "submit_report_btn": "அறிக்கையைச் സമர்ப்பிக்கவும்",
        
        "factcheck_title": "அதிகாரப்பூர்வ உண்மை vs வதந்தி குறியீடு",
        "factcheck_desc": "சமூக அறிக்கைகளைச் சரிபார்க்கவும், அதிகாரப்பூர்வ விளக்கங்கள் மற்றும் நம்பகத்தன்மை குறிச்சൊற்களைக் കാണുക.",
        "search_placeholder": "வதந்திகள் அல்லது தலைப்புகளைத் தேடுங்கள்",
        
        "alert_dispatch_title": "இலக்கு எச்சரிக்கை அனுப்புதல்",
        "dispatch_title": "புவியியல் இலக்கு அவசர எச்சரிக்கைகளை அனுப்பவும்",
        "radius_label": "ஆரம் (கிமீ)",
        "warning_msg_label": "எச்சரிக்கை செய்தி",
        "channels_label": "சேனல்களைத் தேர்ந்தெடுக்கவும்",
        "fire_alert_btn": "புவி-இலக்கு எச்சரிக்கையை அனுப்பவும்",
        
        // Critical alerts & Policy Sidebar Extensions
        "critical_broadcasts_title": "🚨 முக்கிய ஒளிபரப்புகள்",
        "trust_policy_title": "🛡️ சென்டினல் நம்பிக்கை கொள்கை",
        "trust_policy_desc_1": "ஒவ்வொரு அறிக்கையும் அவசரத்தை தீர்மானிக்க மற்றும் துறைக்கு அனுப்ப உடனடி **AI வகைப்பாட்டிற்கு** உட்படுகிறது.",
        "trust_policy_desc_2": "**முக்கியம்:** AI மதிப்பெண்கள் பரிந்துரைகள் மட்டுமே. முழுமையான சரிபார்ப்புக்கு அதிகாரப்பூர்வ துறை பதில்கள் தேவை.",
        "no_emergencies_msg": "செயலிலுள்ள அவசரநிலைகள் எதுவும் இல்லை.",
        "location_prefix": "இருப்பிடம்",
        "alert_suffix": "எச்சரிக்கை",
        "official_clarification_prefix": "அதிகாரப்பூர்வ விளக்கம்",
        "no_posts_msg": "உலக ஊட்டத்தில் பதிவுகள் எதுவும் இல்லை.",
        
        // Departments & alert types
        "water_department": "நீர் துறை",
        "traffic_department": "போக்குவரத்து துறை",
        "weather_department": "வானிலை துறை",
        "disaster_management": "பேரிடர் மேலாண்மை",
        "police__public_safety": "காவல்துறை / பொது பாதுகாப்பு",
        "electricity_department": "மின்சார துறை",
        "other_departments": "இதர துறைகள்",
        "emergency": "அவசரநிலை",
        "flood": "வெள்ளம்",
        "weather": "வானிலை",
        "traffic": "போக்குவரத்து",
        "general": "பொது",
        "emergency_alert_prefix": "அவசர எச்சரிக்கை",
        "target_prefix": "இலக்கு",
        "public_claim_prefix": "பொது அறிக்கை",
        "status_update_suffix": "நிலை இற்றை",
        "pending_verification": "சரிபார்ப்பு மதிப்பாய்வு நிலுவையில் உள்ளது.",
        "government_authority": "அரசு அதிகாரம்",
        "no_bulletins_msg": "பொருந்தக்கூடிய அறிவிப்புகள் எதுவும் இல்லை."
    },
    ml: {
        "world_feed": "📰 വേൾഡ് ഫീഡ്",
        "world_chat": "💬 വേൾഡ് ചാറ്റ്",
        "my_dashboard": "📊 എന്റെ ഡാഷ്ബോർഡ്",
        "report_incident": "✍️ അപകടം റിപ്പോർട്ട് ചെയ്യുക",
        "fact_checker": "🔍 ഫാക്റ്റ് ചെക്കർ",
        "government_portal": "🏛️ ഗവൺമെന്റ് അഡ്മിൻ പോർട്ടൽ",
        "citizen_account": "സിറ്റിസൺ അക്കൗണ്ട്",
        "control_room": "🎛️ നിയന്ത്രണ മുറി",
        "verification_room": "🔍 വെരിഫിക്കേഷൻ റൂം",
        "department_board": "📋 വകുപ്പ് ബോർഡ്",
        "alert_dispatch": "🚨 അലേർട്ട് ഡിസ്പാച്ച്",
        "emergency_map": "🗺️ അടിയന്തര മാപ്പ്",
        "logout": "🚪 ലോഗ് ഔട്ട്",
        
        "cta_title": "ഇന്ന് നിങ്ങളുടെ സമൂഹത്തെ സുരക്ഷിതമാക്കൂ",
        "cta_desc": "തത്സമയ വിവരങ്ങൾ ലഭ്യമാക്കുക, അപകടങ്ങൾ റിപ്പോർട്ട് ചെയ്യുക, ഔദ്യോഗിക ഗവൺമെന്റ് വെരിഫൈഡ് വിവരങ്ങൾ മനസ്സിലാക്കുക. വ്യാജവാർത്തകൾ തടയുക.",
        "enter_platform": "പ്ലാറ്റ്‌ഫോമിൽ പ്രവേശിക്കുക",
        "landing_subtitle": "തത്സമയ ഗവൺമെന്റ് വെരിഫൈഡ് സോഷ്യൽ ഇന്റലിജൻസ് പ്ലാറ്റ്‌ഫോം",
        "stat_ai_time": "AI പ്രോസസിംഗ് സമയം",
        "stat_routing_acc": "റൂട്ടിംഗ് കൃത്യത",
        "stat_alerts_disp": "അയച്ച അലേർട്ടുകൾ",
        "stat_verified_auth": "ഉറപ്പുവരുത്തിയ ആധികാരികത",
        
        "login_title": "ഔദ്യോഗിക ലോഗിൻ പോർട്ടൽ",
        "login_desc": "അധികാരപ്പെടുത്തിയ ദുരന്ത നിവാരണ കോർഡിനേറ്റർമാർക്കും വെരിഫിക്കേഷൻ ഓഫീസർമാർക്കുമുള്ള സുരക്ഷിത ലോഗിൻ.",
        "email_label": "ഇമെയിൽ വിലാസം",
        "password_label": "പാസ്‌വേഡ്",
        "signin_btn": "ലോഗിൻ ചെയ്യുക",
        
        "share_claim_title": "ഒരു ക്ലെയിം അല്ലെങ്കിൽ സംഭവ റിപ്പോർട്ട് പങ്കിടുക",
        "post_report_btn": "റിപ്പോർട്ട് പോസ്റ്റ് ചെയ്യുക",
        "ollama_active": "Ollama ക്ലൗഡ് എഞ്ചിൻ: ആക്റ്റീവ്",
        "feed_subtitle": "തത്സമയ ക്രൗഡ് സോഴ്സ്ഡ് റിപ്പോർട്ടുകളും ഔദ്യോഗിക വിശദീകരണങ്ങളും.",
        "filter_category": "വിഭാഗം അനുസരിച്ച് ഫിൽട്ടർ ചെയ്യുക",
        "all_categories": "എല്ലാ വിഭാഗങ്ങളും",
        
        "report_submit_title": "അപകട റിപ്പോർട്ട് സമർപ്പിക്കുക",
        "report_details_title": "റിപ്പോർട്ട് വിവരങ്ങൾ",
        "incident_title_label": "സംഭവത്തിന്റെ വിഷയം",
        "category_label": "വിഭാഗം",
        "location_label": "സ്ഥലം / മേഖല",
        "severity_label": "തീവ്രത നില",
        "description_label": "സംഭവം വിവരിക്കുക",
        "submit_report_btn": "ഔദ്യോഗിക റിപ്പോർട്ട് സമർപ്പിക്കുക",
        
        "factcheck_title": "ഔദ്യോഗിക സത്യം വേഴ്സസ് വ്യാജവാർത്താ സൂചിക",
        "factcheck_desc": "കമ്മ്യൂണിറ്റി പ്രസ്താവനകൾ പരിശോധിക്കുക, ഔദ്യോഗിക വിശദീകരണങ്ങളും ആധികാരികത ടാഗുകളും കാണുക.",
        "search_placeholder": "വ്യാജവാർത്തകളോ വിഷയങ്ങളോ തിരയുക",
        
        "alert_dispatch_title": "ലക്ഷ്യമിട്ടുള്ള അലേർട്ട് ഡിസ്പാച്ച്",
        "dispatch_title": "ഭൂമിശാസ്ത്രപരമായി ലക്ഷ്യമിട്ടുള്ള അടിയന്തര അലേർട്ടുകൾ അയയ്ക്കുക",
        "radius_label": "വ്യാസാർദ്ധം (കിമീ)",
        "warning_msg_label": "മുന്നറിയിപ്പ് സന്ദേശം",
        "channels_label": "ചാനലുകൾ തിരഞ്ഞെടുക്കുക",
        "fire_alert_btn": "അലേർട്ട് അയയ്ക്കുക",
        
        // Critical alerts & Policy Sidebar Extensions
        "critical_broadcasts_title": "🚨 അടിയന്തര പ്രക്ഷേപണങ്ങൾ",
        "trust_policy_title": "🛡️ സെന്റിനൽ ട്രസ്റ്റ് നയം",
        "trust_policy_desc_1": "എല്ലാ ക്ലെയിമുകളും അടിയന്തിരത നിർണ്ണയിക്കാനും അതാത് വകുപ്പിലേക്ക് മാറ്റാനും തൽക്ഷണം **AI വർഗ്ഗീകരണത്തിന്** വിധേയമാകുന്നു.",
        "trust_policy_desc_2": "**ശ്രദ്ധിക്കുക:** AI അടയാളപ്പെടുത്തലുകൾ നിർദ്ദേശങ്ങൾ മാത്രമാണ്. പൂർണ്ണമായ പരിശോധനയ്ക്ക് ഔദ്യോഗിക വകുപ്പുകളുടെ പ്രതികരണങ്ങൾ ആവശ്യമാണ്.",
        "no_emergencies_msg": "സജീവമായ അടിയന്തര സാഹചര്യങ്ങൾ ഒന്നുമില്ല.",
        "location_prefix": "സ്ഥലം",
        "alert_suffix": "മുന്നറിയിപ്പ്",
        "official_clarification_prefix": "ഔദ്യോഗിക വിശദീകരണം",
        "no_posts_msg": "ഫീഡിൽ പോസ്റ്റുകൾ ഒന്നും ലഭ്യമല്ല.",
        
        // Departments & alert types
        "water_department": "ജലവിഭവ വകുപ്പ്",
        "traffic_department": "ഗതാഗത വകുപ്പ്",
        "weather_department": "കാലാവസ്ഥാ വകുപ്പ്",
        "disaster_management": "ദുരന്ത നിവാരണ വകുപ്പ്",
        "police__public_safety": "പോലീസ് / പൊതു സുരക്ഷ",
        "electricity_department": "വൈദ്യുതി വകുപ്പ്",
        "other_departments": "മറ്റു വകുപ്പുകൾ",
        "emergency": "അടിയന്തരാവസ്ഥ",
        "flood": "പ്രളയം",
        "weather": "കാലാവസ്ഥ",
        "traffic": "ഗതാഗതം",
        "general": "പൊതുവായത്",
        "emergency_alert_prefix": "അടിയന്തര മുന്നറിയിപ്പ്",
        "target_prefix": "ലക്ഷ്യം",
        "public_claim_prefix": "പൊതു ക്ലെയിം",
        "status_update_suffix": "നില അപ്ഡേറ്റ്",
        "pending_verification": "പരിശോധന അവലോകനം ശേഷിക്കുന്നു.",
        "government_authority": "ഗവൺമെന്റ് അതോറിറ്റി",
        "no_bulletins_msg": "പൊരുത്തപ്പെടുന്ന ബുള്ളറ്റിനുകൾ ഒന്നും കണ്ടെത്തിയില്ല."
    }
};

const UI_TEXT_MAP = {
    "World Feed": "world_feed",
    "World Chat": "world_chat",
    "My Dashboard": "my_dashboard",
    "Report Incident": "report_incident",
    "Fact Checker": "fact_checker",
    "Government Admin Portal": "government_portal",
    "Citizen Account": "citizen_account",
    "Control Room": "control_room",
    "Verification Room": "verification_room",
    "Department Board": "department_board",
    "Alert Dispatch": "alert_dispatch",
    "Emergency Map": "emergency_map",
    "Logout": "logout",
    
    // Landing page
    "Secure Your Community Today": "cta_title",
    "Access real-time feeds, report incidents, and stay informed with official government-backed truth. Stop rumors. Stop chaos.": "cta_desc",
    "Enter Platform": "enter_platform",
    "Real-Time Government Verified Social Intelligence Platform": "landing_subtitle",
    "AI Ingestion Time": "stat_ai_time",
    "Routing Accuracy": "stat_routing_acc",
    "Alerts Dispatched": "stat_alerts_disp",
    "Verified Authenticity": "stat_verified_auth",
    
    // Login
    "Official Access Portal": "login_title",
    "Secure authentication for authorized disaster coordinators and verification officers.": "login_desc",
    "Email Address": "email_label",
    "Password": "password_label",
    "Sign In to Command": "signin_btn",
    
    // Feed
    "Share a Claim or Incident Report": "share_claim_title",
    "Post Report": "post_report_btn",
    "Ollama Cloud Engine: Active": "ollama_active",
    "Real-time crowdsourced reports and official clarifications.": "feed_subtitle",
    "Filter by Category": "filter_category",
    "All Categories": "all_categories",
    
    // Report
    "Submit an Incident Report": "report_submit_title",
    "Report Details": "report_details_title",
    "Incident Title": "incident_title_label",
    "Category": "category_label",
    "Location / Region": "location_label",
    "Severity Level": "severity_label",
    "Describe the Incident": "description_label",
    "Submit Official Report": "submit_report_btn",
    
    // Fact check
    "Official Truth vs Rumor Index": "factcheck_title",
    "Verify community statements, check official clarifications, and view authenticity tags.": "factcheck_desc",
    "Search Rumors or Topics": "search_placeholder",
    
    // Alerts Builder
    "Targeted Alert Dispatch": "alert_dispatch_title",
    "Dispatch Geo-Targeted Emergency Alerts": "dispatch_title",
    "Radius (km)": "radius_label",
    "Warning Message": "warning_msg_label",
    "Select Channels": "channels_label",
    "FIRE GEO-TARGETED ALERT": "fire_alert_btn"
};

let currentLang = localStorage.getItem('sentinel_lang') || 'en';

function applyTranslations(lang) {
    // 1. Scan and replace standard elements containing static English text
    const textNodes = [];
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while(node = walk.nextNode()) {
        const parent = node.parentNode;
        // Skip script tags, style tags, select options, and language switcher itself
        if (parent && !['SCRIPT', 'STYLE', 'OPTION', 'SELECT'].includes(parent.tagName) && !parent.classList.contains('lang-switcher-select')) {
            const text = node.nodeValue.trim();
            if (UI_TEXT_MAP[text]) {
                const translationKey = UI_TEXT_MAP[text];
                if (SENTINEL_TRANSLATIONS[lang] && SENTINEL_TRANSLATIONS[lang][translationKey]) {
                    node.nodeValue = SENTINEL_TRANSLATIONS[lang][translationKey];
                }
            } else {
                for (let key in UI_TEXT_MAP) {
                    if (text === key) {
                        const translationKey = UI_TEXT_MAP[key];
                        node.nodeValue = SENTINEL_TRANSLATIONS[lang][translationKey];
                        break;
                    }
                }
            }
        }
    }

    // 2. Translate placeholders for forms
    document.querySelectorAll('input, textarea').forEach(el => {
        const placeholder = el.placeholder ? el.placeholder.trim() : '';
        if (UI_TEXT_MAP[placeholder]) {
            const translationKey = UI_TEXT_MAP[placeholder];
            if (SENTINEL_TRANSLATIONS[lang] && SENTINEL_TRANSLATIONS[lang][translationKey]) {
                el.placeholder = SENTINEL_TRANSLATIONS[lang][translationKey];
            }
        }
    });

    // 3. Translate elements with explicit data-i18n attributes
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (SENTINEL_TRANSLATIONS[lang] && SENTINEL_TRANSLATIONS[lang][key]) {
            el.textContent = SENTINEL_TRANSLATIONS[lang][key];
        }
    });
}

function injectLanguageSelector() {
    const containers = document.querySelectorAll('.logo-container');
    containers.forEach(container => {
        if (container.querySelector('.lang-switcher-select')) return; // Avoid duplicate load

        const select = document.createElement('select');
        select.className = 'lang-switcher-select';

        const languages = [
            { code: 'en', name: '🌐 En' },
            { code: 'hi', name: '🌐 हिं (Hi)' },
            { code: 'te', name: '🌐 తె (Te)' },
            { code: 'ta', name: '🌐 த (Ta)' },
            { code: 'ml', name: '🌐 മ (Ml)' }
        ];

        languages.forEach(lang => {
            const opt = document.createElement('option');
            opt.value = lang.code;
            opt.textContent = lang.name;
            opt.style.background = '#0d1423';
            opt.style.color = '#ffffff';
            if (lang.code === currentLang) opt.selected = true;
            select.appendChild(opt);
        });

        select.addEventListener('change', (e) => {
            const newLang = e.target.value;
            localStorage.setItem('sentinel_lang', newLang);
            currentLang = newLang;
            
            document.querySelectorAll('.lang-switcher-select').forEach(sel => sel.value = newLang);
            location.reload();
        });

        // Insert as sibling after logo container
        container.parentNode.insertBefore(select, container.nextSibling);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    injectLanguageSelector();
    applyTranslations(currentLang);
});

window.applyTranslations = applyTranslations;
window.currentLang = currentLang;
window.SENTINEL_TRANSLATIONS = SENTINEL_TRANSLATIONS;
window.UI_TEXT_MAP = UI_TEXT_MAP;
