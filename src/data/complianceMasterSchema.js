// src/data/complianceMasterSchema.js

export const COMPLIANCE_MASTER_SCHEMA = {
    compliance_system_meta: {
      title: "Global Robot Export Total Compliance Master Schema",
      version: "6.0.0 (Integrated Final)",
      description:
        "Unified rule engine for Electrical (BOM/CCL) and Mechanical (CAD/Precision) regulations for US, EU, and CN markets.",
      markets: ["US", "EU", "CN"],
      data_sources: ["BOM", "CAD", "Schematic", "3D_Modeling"],
    },
  
    critical_checkpoints: [
      {
        group: "POWER_WIRING",
        items: [
          {
            id: "PWR-001",
            name: "AC Power Plug (AC 전원 플러그)",
            source: "BOM",
            keywords: ["Plug", "Power Cord Set", "Mains Plug"],
            regulations: {
              US: { std: "UL 817", req: "UL Listed", mark: "UL", severity: "BLOCKER" },
              EU: {
                std: "IEC 60884-1 / EN 50075",
                req: "VDE/KEMA Approved",
                mark: "VDE",
                severity: "BLOCKER",
              },
              CN: { std: "GB 2099.1", req: "CCC Certified", mark: "CCC", severity: "BLOCKER" },
            },
          },
          {
            id: "PWR-002",
            name: "External Power Cable (외부 전원 코드)",
            source: "BOM",
            keywords: ["Power Cable", "Flexible Cord", "AC Cord"],
            regulations: {
              US: { std: "UL 62", req: "Type SJT, SVT, etc. (UL Listed)", mark: "UL", severity: "BLOCKER" },
              EU: { std: "IEC 60227-5", req: "H05VV-F or H07RN-F", mark: "HAR", severity: "BLOCKER" },
              CN: { std: "GB/T 5023.5", req: "60227 IEC 53 (RVV)", mark: "CCC", severity: "BLOCKER" },
            },
          },
          {
            id: "PWR-003",
            name: "Internal Wiring (내부 배선)",
            source: "BOM",
            keywords: ["Internal Wire", "Hook-up Wire", "AWG"],
            regulations: {
              US: { std: "UL 758", req: "AWM Style 1007/1015, VW-1 Flame Rating", mark: "AWM", severity: "CRITICAL" },
              EU: { std: "IEC 60227-3", req: "H05V-K or H07V-K", mark: "VDE", severity: "CRITICAL" },
              CN: { std: "GB/T 5023.3", req: "60227 IEC 02/06 (RV)", mark: "CCC", severity: "BLOCKER" },
            },
          },
        ],
      },
  
      {
        group: "MECHANICAL_CAD_PRECISION",
        items: [
          {
            id: "MECH-001",
            name: "협착 및 끼임 (Pinch & Shear Points)",
            source: "CAD",
            analysis_logic: "움직이는 부위(Moving Parts) 간의 최소/최대 거리 측정",
            regulations: {
              EU_ISO_13854: {
                standard: "ISO 13854 (최소 간격)",
                criteria: { finger: ">= 25mm", hand: ">= 100mm", arm: ">= 120mm" },
                fail_condition: "간격이 8mm 초과 ~ 25mm 미만일 때 (손가락 협착 위험)",
                severity: "BLOCKER",
              },
              US_ANSI_R15_06: {
                standard: "ANSI/RIA R15.06",
                criteria: "위험 구역 내 물리적 방호벽(Guarding) 존재 여부",
                severity: "CRITICAL",
              },
            },
          },
          {
            id: "MECH-002",
            name: "날카로운 모서리 (Sharp Edges)",
            source: "CAD",
            analysis_logic: "외관 노출 면의 곡률 반경(Radius) 측정",
            regulations: {
              GLOBAL_ISO_12100: {
                standard: "ISO 12100 / UL 1439",
                criteria: "Radius >= 2.0mm",
                fail_condition: "노출 부위의 모서리 반경이 2.0mm 미만인 경우",
                severity: "MAJOR",
              },
            },
          },
          {
            id: "MECH-003",
            name: "전도 안정성 (Stability)",
            source: "CAD",
            analysis_logic: "무게중심(CoG) 및 바닥면적 대비 기울기 시뮬레이션",
            regulations: {
              EU_ISO_13482: {
                standard: "ISO 13482",
                criteria: "10도 경사면 정지 상태 유지",
                fail_condition: "10도 경사에서 무게중심이 지지 범위를 벗어남",
                severity: "CRITICAL",
              },
              US_ANSI_B56_5: {
                standard: "ANSI B56.5",
                criteria: "Dynamic stability check",
                severity: "HIGH",
              },
            },
          },
          {
            id: "MECH-004",
            name: "비상정지 버튼 위치 (E-Stop Ergonomics)",
            source: "CAD",
            analysis_logic: "지면(Ground)으로부터 수직 높이 측정",
            regulations: {
              GLOBAL_ISO_13850: {
                standard: "ISO 13850 / NFPA 79",
                criteria: "0.6m <= 높이 <= 1.7m",
                fail_condition: "비상정지 버튼 높이가 범위를 벗어난 경우",
                severity: "BLOCKER",
              },
            },
          },
        ],
      },
  
      {
        group: "ACTIVE_PROTECTION",
        items: [
          {
            id: "PROT-001",
            name: "Fuse (퓨즈)",
            source: "BOM",
            regulations: {
              US: { std: "UL 248-14", req: "UL Listed/Recognized", severity: "BLOCKER" },
              EU: { std: "IEC 60127", req: "SEMKO/VDE Approved", severity: "BLOCKER" },
              CN: { std: "GB 9364", req: "CCC Certified", severity: "BLOCKER" },
            },
          },
          {
            id: "ACT-003",
            name: "Lithium Battery Cell/Pack (배터리)",
            source: "BOM",
            regulations: {
              US: { std: "UL 1642 / UL 2054", req: "UL Recognized", severity: "BLOCKER" },
              EU: { std: "IEC 62133-2", req: "CB Certificate", severity: "BLOCKER" },
              CN: { std: "GB 31241", req: "CQC/CCC Certified", severity: "BLOCKER" },
            },
          },
        ],
      },
  
      {
        group: "MATERIALS_LABELING",
        items: [
          {
            id: "MAT-001",
            name: "Enclosure Plastic (외장 플라스틱 난연성)",
            source: "BOM",
            regulations: {
              US: { std: "UL 94", req: "Min. V-1 or V-0 Flame Rating", severity: "CRITICAL" },
              EU: { std: "IEC 60695-2", req: "Glow Wire Test (750°C/850°C)", severity: "CRITICAL" },
            },
          },
          {
            id: "LBL-001",
            name: "Product Nameplate (제품 명판)",
            source: "CAD/Graphic",
            regulations: {
              US: { std: "UL 969", req: "UL Recognized Material, English text", severity: "MAJOR" },
              EU: { std: "Machinery Directive", req: "CE Mark, Manufacturer Info, Ratings", severity: "BLOCKER" },
              CN: { std: "GB 5296.1", req: "Simplified Chinese, CCC Mark", severity: "BLOCKER" },
            },
          },
        ],
      },
    ],
  };
  