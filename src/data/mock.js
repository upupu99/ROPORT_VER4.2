// src/data/mock.js

export const PROJECTS = [
    { id: "p1", name: "자율주행 트랙터 X1", country: "EU", progress: 75, status: "순항 중", color: "blue" },
    { id: "p2", name: "과수 수확 로봇 A2", country: "US", progress: 30, status: "설계 변경", color: "indigo" },
    { id: "p3", name: "방제 드론 D5", country: "CN", progress: 10, status: "초기 단계", color: "red" },
  ];
  
  export const PROJECT_ASSETS = [
    { id: "asset_1", name: "Wait_Concept_Design_v2.dwg", type: "CAD", date: "2023.10.24", size: "25 MB" },
    { id: "asset_2", name: "Final_BOM_List_rev3.xlsx", type: "BOM", date: "2023.10.25", size: "1.2 MB" },
    { id: "asset_3", name: "Safety_Circuit_Schematic.pdf", type: "Circuit", date: "2023.10.26", size: "3.4 MB" },
    { id: "asset_4", name: "Tractor_Control_SW_v1.0.zip", type: "SW", date: "2023.10.27", size: "42 MB" },
    { id: "asset_5", name: "User_Manual_KR_v1.5.pdf", type: "Manual", date: "2023.11.02", size: "15 MB" },
    { id: "asset_6", name: "Test_Plan_Draft_v0.9.docx", type: "Doc", date: "2023.11.05", size: "0.8 MB" },
  ];
  
  export const REMEDIATION_DATA = {
    EU: [
      { id: "eu_r1", task: "비상정지 버튼 배경색 노란색으로 변경 (ISO 13850)", status: "pending", priority: "High", type: "Design" },
      { id: "eu_r2", task: "전원 케이블 CE 인증품(H05VV-F)으로 교체", status: "pending", priority: "High", type: "Part" },
      { id: "eu_r3", task: "구동부 협착 방지 커버 추가 (Gap > 25mm)", status: "in_progress", priority: "Medium", type: "Design" },
      { id: "eu_r4", task: "모터 접지선 색상 G/Y(녹/황) 규격 확인", status: "done", priority: "Low", type: "Check" },
    ],
    US: [
      { id: "us_r1", task: "메인 차단기 UL 489 인증품으로 변경", status: "pending", priority: "High", type: "Part" },
      { id: "us_r2", task: "배터리 팩 UL 2054 시험 성적서 확보", status: "in_progress", priority: "High", type: "Doc" },
      { id: "us_r3", task: "제품 라벨 ANSI Z535 규격(Signal Word) 적용", status: "done", priority: "Medium", type: "Design" },
    ],
    CN: [
      { id: "cn_r1", task: "전원 플러그 CCC 강제 인증 규격품 적용", status: "pending", priority: "Critical", type: "Part" },
      { id: "cn_r2", task: "사용자 매뉴얼 내 유해물질 표기(RoHS Table) 추가", status: "pending", priority: "Medium", type: "Doc" },
      { id: "cn_r3", task: "경고 문구 GB 표준 중문 번역 검수", status: "done", priority: "Low", type: "Design" },
    ],
  };
  
  export const DOC_PROCESS_CONFIG = {
    EU: {
      label: "유럽 (CE Marking)",
      color: "blue",
      technicalInputs: [
        { id: "eu_tech_1", name: "위험성 평가서 기초자료 (ISO 12100)", desc: "기계적/전기적 위험요소 및 초기 위험도 분석 데이터", required: true, iconKey: "AlertTriangle" },
        { id: "eu_tech_2", name: "EHSR 체크리스트", desc: "기계지침 필수 보건 안전 요구사항 적용 여부", required: true, iconKey: "CheckSquare" },
        { id: "eu_tech_3", name: "도면 및 회로도 (Drawings)", desc: "전기 회로도, 유압/공압 도면, 기구 조립도", required: true, iconKey: "Cpu" },
        { id: "eu_tech_4", name: "시험 성적서 (Test Report)", desc: "EN 60204-1 등 적용 표준 시험 결과서", required: true, iconKey: "FileBadge" },
        { id: "eu_tech_5", name: "사용자 매뉴얼 초안", desc: "의도된 사용 목적 및 안전 수칙 포함 (국문)", required: true, iconKey: "BookOpen" },
      ],
      adminInputs: [
        { id: "eu_admin_1", name: "적합성 선언서(DoC) 정보", desc: "제조사, 대리인(EAR), 적용 지침 및 표준 리스트", required: true, iconKey: "ScrollText" },
      ],
      generatedOutputs: [
        { name: "EC_Declaration_of_Conformity_Final.pdf", type: "DoC", desc: "유럽 적합성 선언서 최종본", size: "1.2MB", file: "EU_DOC_FINAL", },
        { name: "Technical_Construction_File(TCF).zip", type: "TCF", desc: "CE 인증 통합 기술문서 패키지", size: "45MB" },
        { name: "Risk_Assessment_Report.pdf", type: "Report", desc: "ISO 12100 기반 위험성 평가 보고서", size: "2.5MB" },
        { name: "User_Manual_EU_Multilingual.pdf", type: "Manual", desc: "다국어 변환 및 필수 경고 문구 반영 매뉴얼", size: "8.5MB" },
      ],
    },
  
    US: {
      label: "미국 (NRTL / FCC)",
      color: "blue",
      technicalInputs: [
        { id: "us_tech_1", name: "NRTL 구조 검토서 (CDR) 자료", desc: "배터리/모터 구동 제품 전기·화재 안전 검증 데이터", required: true, iconKey: "Flame" },
        { id: "us_tech_2", name: "FCC 기술 보고서 (Technical Report)", desc: "무선 통신(GPS/LTE) 간섭 비발생 증명 시험 데이터", required: true, iconKey: "Radio" },
        { id: "us_tech_3", name: "위험성 평가 보고서 (ANSI B11.0)", desc: "기계적 위험 분석 및 저감 조치 증명", required: true, iconKey: "AlertTriangle" },
        { id: "us_tech_4", name: "사용자 매뉴얼 (ANSI Z535)", desc: "PL 대응 경고 색상/신호어 적용 초안", required: true, iconKey: "BookOpen" },
      ],
      adminInputs: [
        { id: "us_admin_1", name: "대리인 지정 위임장", desc: "현지 TCB/시험소 제출 권한 위임 서류", required: true, iconKey: "FilePenLine" },
        { id: "us_admin_2", name: "기밀 유지 요청서", desc: "회로도/블록도 FCC 비공개 요청", required: true, iconKey: "Lock" },
        { id: "us_admin_3", name: "인증 신청서 (Form 731)", desc: "FCC 공식 인증 신청 양식", required: true, iconKey: "FileText" },
        
      ],
      generatedOutputs: [
        { name: "Construction_Data_Report(CDR).pdf", type: "CDR", desc: "UL 승인용 구조 검토 완료 보고서", size: "3.5MB" },
        { name: "FCC_Technical_Report_Final.pdf", type: "Report", desc: "FCC 무선 시험 기술 보고서", size: "2.1MB" },
        { name: "User_Manual_ANSI_Standard.pdf", type: "Manual", desc: "ANSI Z535 규격 준수 영문 매뉴얼", size: "12MB" },
      ],
    },
  
    CN: {
      label: "중국 (CCC / CR)",
      color: "blue",
      technicalInputs: [
        { id: "cn_tech_1", name: "로봇 사용자설명서 (국문 원본)", desc: "중문 매뉴얼 생성 및 GB 경고문구 반영용", required: true, iconKey: "BookOpen" },
        { id: "cn_tech_2", name: "로봇 부품목록 (BOM)", desc: "핵심 안전부품 식별 및 인증서 매핑용", required: true, iconKey: "ListChecks" },
        { id: "cn_tech_3", name: "로봇 카탈로그/사양서", desc: "제품 묘사서 및 PTR 작성 근거 데이터", required: true, iconKey: "FileSearch" },
        { id: "cn_tech_4", name: "자율주행 알고리즘 개요서", desc: "센서 구성 및 안전정지 로직 설명", required: false, iconKey: "Network" },
        { id: "cn_tech_5", name: "제품 기술 요구사항 (PTR) 기초", desc: "최대 1톤 이하 농업 운반차 적용 조항 매핑", required: true, iconKey: "Scale" },
      ],
      adminInputs: [
        { id: "cn_admin_1", name: "CCC 인증 신청서", desc: "제품/제조사/공장 정보 및 적용 GB 표준 목록", required: true, iconKey: "FileText" },
        { id: "cn_admin_2", name: "사업자등록증 (영문/중문)", desc: "번역 공증된 사업자 등록 증빙", required: true, iconKey: "FileBadge" },
        { id: "cn_admin_3", name: "위임장 (POA)", desc: "CCC 인증/시험/공장심사 대행 권한 위임", required: true, iconKey: "FilePenLine" },
        { id: "cn_admin_4", name: "공장심사조사표 (Factory Audit)", desc: "조직도, 품질매뉴얼, 공정도 등 패키지", required: true, iconKey: "Factory" },
        { id: "cn_admin_5", name: "일치성 설명서", desc: "제품과 제출 문서의 동일성 입증 서류", required: true, iconKey: "CheckCircle" },
      ],
      generatedOutputs: [
        { name: "CCC_Application_Package.zip", type: "App", desc: "CCC 신청서 및 행정 서류 일체", size: "5.2MB" },
        { name: "Product_Description_GB.pdf", type: "Desc", desc: "제품 묘사서 및 기술 요구사항(PTR) 중문본", size: "1.8MB" },
        { name: "User_Manual_CN_GB_Standard.pdf", type: "Manual", desc: "GB 표준 준수 중문 사용자 설명서", size: "9.5MB" },
        { name: "Critical_Component_List_CCC.xlsx", type: "BOM", desc: "CCC 대상 핵심 부품 리스트", size: "0.6MB" },
      ],
    },
  };
  
  export const CHAT_HISTORY = [
    { id: 1, role: "ai", text: "안녕하세요! CertiMatch AI Chatbot입니다.\n미국/유럽/중국 수출 규제에 대해 무엇이든 물어보세요." },
  ];
  
  // Labs 데이터(나중에 LabsView에 씀)
  export const LABS_DATA = [
    {
      id: 1,
      name: "KTC 군포센터",
      chamber: "10m EMC",
      cert: "KOLAS, UL",
      distance: "15km",
      costDisplay: "1,500만원",
      rawCost: 1500,
      durationDisplay: "2.5개월",
      leadTime: 2.5,
      url: "https://www.ktc.re.kr",
      totalScore: 98,
      tags: ["Best Match", "Large Chamber"],
      scores: { tech: 99, cost: 85, time: 90, dist: 95 },
      reason: "귀사의 로봇 크기(2m)를 수용 가능한 10m 챔버를 보유하고 있으며, 타겟 국가(EU) 인증 경험이 가장 풍부합니다.",
  
      // ✅ 추가: 보유 인증/역량
      accreditations: ["KOLAS 공인시험기관", "UL 시험 협력 네트워크", "EMC/안전 동시 수행"],
  
      // ✅ 추가: AI 분석
      ai: {
        summary: "일정 우선(Lead Time) + 해외 대응 경험이 필요할 때 1순위.",
        bullets: [
          "EU/US 동시 준비 전제: 안전(전기/기계)+EMC를 한 기관에서 묶어 리드타임 단축 가능.",
          "사양서/매뉴얼/회로도 기반으로 추가 자료(리스크 평가, EHSR 체크리스트) 템플릿 제공 가능.",
          "농기계/산업기계 시험 레퍼런스가 많아 설계 변경(조치항목) 피드백이 빠른 편.",
        ],
        nextDocs: ["회로도 최신본(REV)", "EMC 시험 계획(없으면 템플릿)", "매뉴얼 경고문(초안)"],
      },
  
      // ✅ 추가: 4가지 스코어링
      scoring: {
        cost: 85, // 비용 점수
        leadTime: 90, // 리드타임 점수
        successRate: 92, // 과거 인증성공률 점수
        testField: 99, // 시험분야 적합 점수
      },
    },
    {
      id: 2,
      name: "KTL 진주본원",
      chamber: "10m EMC",
      cert: "KOLAS, CE",
      distance: "320km",
      costDisplay: "1,200만원",
      rawCost: 1200,
      durationDisplay: "3.0개월",
      leadTime: 3.0,
      url: "https://www.ktl.re.kr",
      totalScore: 88,
      tags: ["Lowest Cost"],
      scores: { tech: 99, cost: 95, time: 80, dist: 40 },
      reason: "비용은 가장 저렴하나, 거리가 멀어(320km) 시료 운송 비용 및 엔지니어 출장 부담이 발생할 수 있습니다.",
  
      accreditations: ["KOLAS 공인시험기관", "CE 대응 컨설팅 경험", "문서검토(기술문서) 지원"],
      ai: {
        summary: "비용/문서 완성도 중심(CE 문서 패키지까지 정리)로 가려면 적합.",
        bullets: [
          "CE(기계/EMC) 대응에서 기술문서(TCF) 구성 검토 경험이 많아 서류 완성도에 유리.",
          "비용대비 범위가 좋아 예산이 민감한 케이스에서 추천(단, 일정은 보수적으로 산정).",
          "BOM/회로도 기반 부품 안전성(인증부품) 확인 프로세스가 체계적이라 리스크 줄이기 좋음.",
        ],
        nextDocs: ["BOM(제조사/모델명 포함)", "회로도/블록도", "적용 표준 리스트(초안)"],
      },
      scoring: {
        cost: 95,
        leadTime: 80,
        successRate: 85,
        testField: 92,
      },
    },
    {
      id: 3,
      name: "HCT (민간시험소)",
      chamber: "3m Chamber",
      cert: "KOLAS",
      distance: "20km",
      costDisplay: "1,800만원",
      rawCost: 1800,
      durationDisplay: "1.5개월",
      leadTime: 1.5,
      url: "https://www.hct.co.kr",
      totalScore: 75,
      tags: ["Fastest"],
      scores: { tech: 60, cost: 70, time: 99, dist: 90 },
      reason: "일정은 가장 빠르나, 보유 챔버(3m)가 로봇 크기에 비해 협소하여 사전 기술 미팅이 필수적입니다.",
  
      accreditations: ["KOLAS 공인시험", "민간(일정 유연)", "커스텀 시험 설계 가능"],
      ai: {
        summary: "가장 빠른 일정이 필요하거나, 커스텀 시험/현장 조건 반영이 필요할 때 선택.",
        bullets: [
          "민간기관이라 시험 일정 조정이 유연하고 급행(패스트트랙) 옵션 협의 가능.",
          "자율주행/전장/센서 구성에 맞춘 커스텀 시험 설계(환경/내구/EMC 일부) 협의가 쉬움.",
          "단가가 높을 수 있어 ‘기간 단축’ 가치가 큰 프로젝트에서 효율적.",
        ],
        nextDocs: ["시험 범위 우선순위(필수/선택)", "현장 환경조건(온도/습도/진동)", "센서/통신 모듈 스펙"],
      },
      scoring: {
        cost: 70,
        leadTime: 99,
        successRate: 78,
        testField: 75,
      },
    },
  ];