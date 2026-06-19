export interface Product {
  id: string;
  name: string;
  desc: string;
  badge?: string;
  category: 'immune' | 'energy' | 'beauty' | 'detox' | 'daily';
  tags: string[];
  iconName: string; // Used to fetch from a dictionary
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  period: string;
  text: string;
  stars: number;
}

export interface AboutItem {
  title: string;
  desc: string;
  iconName: string;
}

export interface WhyItem {
  num: string;
  title: string;
  desc: string;
  iconName: string;
  featured?: boolean;
}

export const PRODUCTS_DATA: Product[] = [
  // Immune System
  {
    id: 'imm-1',
    name: '超級免疫複合配方',
    desc: '整合 β-葡聚糖、紫錐花萃取物與鋅，全方位強化人體免疫防線，抵禦外來威脅。',
    badge: '暢銷 No.1',
    category: 'immune',
    tags: ['β-葡聚糖', '天然植萃', '快速吸收'],
    iconName: 'Shield'
  },
  {
    id: 'imm-2',
    name: '抗氧化細胞防護素',
    desc: '高濃度白藜蘆醇結合葡萄籽萃取，深層清除自由基，從細胞層面保護您的健康。',
    badge: '新品上市',
    category: 'immune',
    tags: ['白藜蘆醇', '葡萄籽', '抗氧化'],
    iconName: 'Sparkles'
  },
  {
    id: 'imm-3',
    name: '益生菌腸道衛士',
    desc: '500 億活性益生菌配合益生元，修復腸道生態系，提升整體免疫機能與消化健康。',
    category: 'immune',
    tags: ['500億益生菌', '腸道健康', '雙層包覆'],
    iconName: 'Activity'
  },
  // Energy
  {
    id: 'ene-1',
    name: '粒線體能量激活素',
    desc: 'NMN 與輔酶 Q10 複合配方，直接激活細胞能量工廠，讓您全天保持活力充沛。',
    badge: '明星產品',
    category: 'energy',
    tags: ['NMN', '輔酶Q10', '持久能量'],
    iconName: 'Zap'
  },
  {
    id: 'ene-2',
    name: '代謝加速燃脂素',
    desc: '綠茶萃取物、左旋肉鹼與 CLA 三效合一，科學加速代謝，精雕細琢健康體態。',
    category: 'energy',
    tags: ['左旋肉鹼', 'CLA', '代謝提升'],
    iconName: 'Flame'
  },
  {
    id: 'ene-3',
    name: '腦神經活化精華',
    desc: '獅鬃菇、磷脂醯絲胺酸與 Omega-3，全面提升認知功能、記憶力與專注力。',
    category: 'energy',
    tags: ['獅鬃菇', 'Omega-3', '腦部健康'],
    iconName: 'Brain'
  },
  // Beauty
  {
    id: 'bea-1',
    name: '深海膠原蛋白精華',
    desc: '日本深海魚膠原蛋白肽，分子量僅 3000Da，快速被皮膚吸收，恢復肌膚豐彈水潤。',
    badge: '女性首選',
    category: 'beauty',
    tags: ['深海膠原蛋白', '3000Da', '彈力抗老'],
    iconName: 'Sparkles'
  },
  {
    id: 'bea-2',
    name: '美白淡斑複合素',
    desc: '傳明酸結合高純度穀胱甘肽，從內而外調理色素代謝，打造透亮均勻天使肌。',
    category: 'beauty',
    tags: ['傳明酸', '穀胱甘肽', '美白淡斑'],
    iconName: 'Crown'
  },
  {
    id: 'bea-3',
    name: '玻尿酸補水奇蹟素',
    desc: '三重不同分子量玻尿酸複合配方，深層補水，持續 24 小時滋潤鎖水，告別乾燥肌。',
    category: 'beauty',
    tags: ['三重玻尿酸', '24H補水', '鎖水保濕'],
    iconName: 'Droplet'
  },
  // Detox
  {
    id: 'det-1',
    name: '肝臟排毒淨化素',
    desc: '水飛薊素結合高純度薑黃素，強效保護肝臟細胞，促進肝功能排毒，還原健康神采。',
    badge: '熱銷推薦',
    category: 'detox',
    tags: ['水飛薊素', '薑黃素', '護肝排毒'],
    iconName: 'Heart'
  },
  {
    id: 'det-2',
    name: '重金屬螯合排除素',
    desc: '天然螯合劑黃金配方，安全高效地排除體內累積的重金屬與環境毒素，活化細胞。',
    category: 'detox',
    tags: ['天然螯合', '重金屬排除', '細胞淨化'],
    iconName: 'Trash'
  },
  {
    id: 'det-3',
    name: '全身細胞清潔配方',
    desc: '結合間歇性斷食科學，提供必要微量元素與維生素支持，啟動細胞自噬機制深度清潔。',
    category: 'detox',
    tags: ['細胞自噬', '微量元素', '深度淨化'],
    iconName: 'Leaf'
  },
  // Daily Products
  {
    id: 'dai-1',
    name: '極奢植萃 · 女用系列日用品',
    desc: '專為女性生理與日常護理研發，蘊含多重天然有機植萃，極致溫和親膚，悉心守護敏感細緻。',
    badge: '溫和呵護',
    category: 'daily',
    tags: ['有機植萃', '親膚低敏', '生理護理'],
    iconName: 'Crown'
  },
  {
    id: 'dai-2',
    name: '全效無感 · 生活系列日用品',
    desc: '完美平衡天然與科技，涵蓋潔膚、洗沐等周身日常呵護，富含維他命精華，煥活周身每一扇微循環。',
    badge: '每日必備',
    category: 'daily',
    tags: ['pH5.5弱酸', '溫和潔淨', '日常煥活'],
    iconName: 'Sparkles'
  },
  {
    id: 'dai-3',
    name: '極致防禦 · 家庭系列日用品',
    desc: '一瓶解決全家人對潔淨與健康防禦的多元渴求，高規格植萃抗菌阻隔配方，構築全家安心的生活屏障。',
    badge: '全家適用',
    category: 'daily',
    tags: ['抗菌阻隔', '大容量裝', '無螢光劑'],
    iconName: 'Shield'
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't-1',
    name: '陳小姐',
    role: '台北 | 黃金領袖',
    period: '加入 3 年',
    text: '加入 GET HEALTH 後，不僅我的健康狀況得到極大改善，更在短短一年內建立了穩健的被動收入。這不只是一份事業，更是一種生活品質的自我昇華。',
    stars: 5
  },
  {
    id: 't-2',
    name: '林太太',
    role: '高雄 | 銀級夥伴',
    period: '加入 2 年',
    text: '身為三個學齡孩子的媽媽，自由的時間極其有限。GET HEALTH 貼心的彈性工作模式讓我能在兼顧家庭的同時，每月穩定獲得可觀收益，由衷感謝本平台。',
    stars: 5
  },
  {
    id: 't-3',
    name: '王先生',
    role: '新竹 | 鑽石執行官',
    period: '加入 5 年',
    text: '產品品質真的硬實力，我自己每日飲用免疫複合配方，整個冬季都神清氣爽。推薦給親友後，好評如潮，自動購回率極高，組織業績與日俱增！',
    stars: 5
  },
  {
    id: 't-4',
    name: '張先生',
    role: '台中 | 黃金領袖',
    period: '加入 2 年半',
    text: '從一個對直銷完全陌生的普通朝九晚五上班族，到現在月營收超越原本底薪三倍。GET HEALTH 的系統化培訓極限降低了經營門檻，是不可多得的機會！',
    stars: 5
  }
];

export const ABOUT_ITEMS: AboutItem[] = [
  {
    title: '科研驅動',
    desc: '與全球頂尖生物醫學機構合作，持續投入研發，確保每款產品均具備卓越的臨床純度。',
    iconName: 'FlaskConical'
  },
  {
    title: '國際認證',
    desc: '全線通過 ISO、GMP、NSF 等多項權威產能認證，為您的每日調理保駕護航。',
    iconName: 'Award'
  },
  {
    title: '全球佈局',
    desc: '業務橫跨 28 個國家地區，建成便捷的低溫全球物流鏈，讓健康無國界延展。',
    iconName: 'Globe'
  },
  {
    title: '夥伴共贏',
    desc: '秉持完全公開公正的全球級分潤制度，讓所有夥伴的卓越貢獻與夢想均得以變現。',
    iconName: 'Users'
  }
];

export const WHY_ITEMS: WhyItem[] = [
  {
    num: '01',
    title: '量子生物技術',
    desc: '引領業界的量子微晶包裹技術，大幅提昇原料活性分子，令細胞定向吸收率呈 3 倍巨幅提升。',
    iconName: 'Atom'
  },
  {
    num: '02',
    title: '獨家專利配方',
    desc: '累積研發 47 項多國發明專利，其「生物奈米載體技術」打破吸收瓶頸，領跑高端功能性食品。',
    iconName: 'Award',
    featured: true
  },
  {
    num: '03',
    title: 'AI 個人化健康方案',
    desc: '多維大數據健康評量模型，為每位尊貴客戶訂製全方位健康管理建議，實現精準保養。',
    iconName: 'Sparkles'
  },
  {
    num: '04',
    title: '區塊鏈溯源體系',
    desc: '採用去中心化帳本，一碼溯源全鏈條生產過程，從田間栽培到舌尖服用，滴水不漏。',
    iconName: 'Shield'
  },
  {
    num: '05',
    title: '零壓無憂分成軌道',
    desc: '專利多層級權益分潤，隨買隨結，配合頂格佣金提取，為廣大創業者解綁被動收益鏈。',
    iconName: 'TrendingUp'
  },
  {
    num: '06',
    title: '雙軌金牌培訓系統',
    desc: '業界導師常規開設線上及線下手把手講堂，從銷售通識到戰略商務，助力速成產業菁英。',
    iconName: 'Users'
  }
];
