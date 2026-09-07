import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

/**
 * Seed API endpoint — populates the database with sample courses,
 * modules, jobs, and RAG documents for demo purposes.
 * 
 * Call this once after setting up Supabase:
 * POST /api/seed
 */
export async function POST() {
  try {
    const supabase = createAdminClient();

    // ==========================================
    // SEED COURSES
    // ==========================================
    const courses = [
      {
        title: 'Introduction to Cooperative Societies',
        description: 'Learn the fundamentals of cooperative societies — their formation, principles, governance, and role in India\'s economic development. Covers the Multi-State Cooperative Societies Act and state-level regulations.',
        category: 'cooperative_law' as const,
        difficulty: 'beginner' as const,
        price: 0,
        is_published: true,
      },
      {
        title: 'Accounting & Financial Management for Cooperatives',
        description: 'Master the accounting principles specific to cooperative societies. Covers bookkeeping, audit requirements, profit distribution, reserve funds, and compliance with regulatory financial standards.',
        category: 'accounting' as const,
        difficulty: 'intermediate' as const,
        price: 0,
        is_published: true,
      },
      {
        title: 'Cooperative Management & Governance',
        description: 'Understand the management structure of cooperatives — board elections, member rights, general body meetings, bylaws, and effective governance practices for transparent operations.',
        category: 'management' as const,
        difficulty: 'intermediate' as const,
        price: 0,
        is_published: true,
      },
      {
        title: 'Digital Skills for Cooperative Members',
        description: 'Build essential digital literacy — learn to use computers, internet, digital payments, and basic software tools for day-to-day cooperative operations.',
        category: 'technology' as const,
        difficulty: 'beginner' as const,
        price: 0,
        is_published: true,
      },
      {
        title: 'Advanced Cooperative Law & Compliance',
        description: 'Deep dive into legal frameworks governing cooperatives — Multi-State Cooperative Societies Act 2002, RCS compliance, dispute resolution, and recent amendments.',
        category: 'cooperative_law' as const,
        difficulty: 'advanced' as const,
        price: 99,
        is_published: true,
      },
    ];

    const { data: insertedCourses } = await supabase
      .from('courses')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .upsert(courses as any[], { onConflict: 'title' })
      .select();

    // ==========================================
    // SEED MODULES FOR EACH COURSE
    // ==========================================
    if (insertedCourses && insertedCourses.length > 0) {
      const allModules = [];

      // Course 1: Introduction to Cooperative Societies
      const course1 = insertedCourses[0];
      allModules.push(
        {
          course_id: course1.id,
          title: 'What is a Cooperative Society?',
          content: `# What is a Cooperative Society?\n\nA **cooperative society** is a voluntary association of individuals who come together for mutual benefit. It is based on the principles of:\n\n- **Self-help and mutual aid**\n- **Democratic management** (one member, one vote)\n- **Open membership**\n- **Economic participation** by members\n\n## Key Characteristics\n\n1. **Voluntary Association**: Anyone can join or leave\n2. **Democratic Control**: Each member has equal voting rights\n3. **Limited Return on Capital**: Profits are shared equitably\n4. **Service Motive**: Focus on member welfare, not just profit\n\n## Types of Cooperatives in India\n\n| Type | Example |\n|------|--------|\n| Consumer | Kendriya Bhandar |\n| Producer | AMUL |\n| Credit | Primary Agricultural Credit Societies |\n| Marketing | NAFED |\n| Housing | Housing Cooperatives |\n\n> **Did you know?** India has over 8 lakh registered cooperative societies covering 97% of villages.`,
          order_index: 0,
          duration_minutes: 15,
        },
        {
          course_id: course1.id,
          title: 'Principles of Cooperation',
          content: `# The 7 Cooperative Principles\n\nThe International Cooperative Alliance (ICA) defines **7 principles** that guide cooperatives worldwide:\n\n## 1. Voluntary and Open Membership\nCooperatives are open to all persons who can use their services and are willing to accept membership responsibilities.\n\n## 2. Democratic Member Control\nCooperatives are controlled by their members, who actively participate in setting policies. **One member = one vote.**\n\n## 3. Member Economic Participation\nMembers contribute equitably to the capital of their cooperative. Surpluses are allocated for:\n- Developing the cooperative\n- Benefiting members in proportion to their transactions\n- Supporting other activities approved by the membership\n\n## 4. Autonomy and Independence\nCooperatives are autonomous, self-help organizations controlled by their members.\n\n## 5. Education, Training, and Information\nCooperatives provide education and training for their members, elected representatives, managers, and employees.\n\n## 6. Cooperation Among Cooperatives\nCooperatives serve their members most effectively by working together through local, national, and international structures.\n\n## 7. Concern for Community\nCooperatives work for the sustainable development of their communities.`,
          order_index: 1,
          duration_minutes: 20,
        },
        {
          course_id: course1.id,
          title: 'Legal Framework in India',
          content: `# Legal Framework for Cooperatives in India\n\n## Constitutional Provisions\n\nThe **97th Constitutional Amendment Act, 2011** added:\n- **Article 19(1)(c)**: Right to form cooperative societies\n- **Article 43B**: Promotion of cooperatives by the State\n- **Part IXB**: Articles 243ZH to 243ZT dealing with cooperative societies\n\n## Key Legislation\n\n### 1. Multi-State Cooperative Societies Act, 2002\n- Governs cooperatives operating across state boundaries\n- Administered by the Central Registrar of Cooperative Societies\n- Covers registration, membership, management, and winding up\n\n### 2. State Cooperative Societies Acts\n- Each state has its own cooperative legislation\n- Governs cooperatives operating within that state\n- Administered by the State Registrar of Cooperative Societies\n\n### 3. Ministry of Cooperation\n- Established in 2021 under the Government of India\n- Aims to strengthen the cooperative movement\n- Focus on transparency, modernization, and accessibility\n\n## Registration Process\n\n1. Minimum **10 members** required (7 for multi-state)\n2. Draft bylaws and submit application to Registrar\n3. Pay registration fee\n4. Registrar reviews and issues registration certificate\n5. Cooperative is now a **body corporate** with legal status`,
          order_index: 2,
          duration_minutes: 25,
        }
      );

      // Course 2: Accounting
      const course2 = insertedCourses[1];
      allModules.push(
        {
          course_id: course2.id,
          title: 'Basics of Cooperative Accounting',
          content: `# Basics of Cooperative Accounting\n\nCooperative accounting follows specific rules that differ from corporate accounting.\n\n## Key Differences\n\n| Aspect | Corporate | Cooperative |\n|--------|-----------|-------------|\n| Profit | Dividends to shareholders | Patronage dividend to members |\n| Capital | Share capital | Member contributions |\n| Reserves | Discretionary | Mandatory reserve funds |\n| Audit | Annual | Statutory, by government auditors |\n\n## Essential Books of Accounts\n\n1. **Cash Book**: Records all cash transactions\n2. **Ledger**: Contains all member accounts\n3. **Journal**: Daily transaction entries\n4. **Share Register**: Member shareholdings\n5. **Loan Register**: Details of loans given/received\n\n## Reserve Funds\n\nEvery cooperative must maintain:\n- **Statutory Reserve Fund**: Minimum 25% of net profit\n- **Education Fund**: Typically 5% for member education\n- **Building Fund**: For office/infrastructure development`,
          order_index: 0,
          duration_minutes: 20,
        },
        {
          course_id: course2.id,
          title: 'Audit Requirements',
          content: `# Audit Requirements for Cooperatives\n\n## Types of Audit\n\n### 1. Statutory Audit\n- **Mandatory** for all registered cooperatives\n- Conducted by auditors appointed by the Registrar\n- Must be completed within **6 months** of financial year end\n- Covers all financial statements and records\n\n### 2. Internal Audit\n- Voluntary but recommended for large cooperatives\n- Helps identify irregularities early\n- Conducted by internal audit committee\n\n### 3. Performance Audit\n- Evaluates operational efficiency\n- Assesses whether cooperative is meeting its objectives\n- Reviews management decisions and resource utilization\n\n## Audit Report Components\n\n1. Financial statements review\n2. Compliance with bylaws\n3. Reserve fund maintenance\n4. Member transaction fairness\n5. Management effectiveness\n6. Recommendations for improvement\n\n> **Important**: Non-compliance with audit requirements can lead to penalties, supersession of the board, or even dissolution of the cooperative.`,
          order_index: 1,
          duration_minutes: 15,
        }
      );

      // Course 3: Management
      const course3 = insertedCourses[2];
      allModules.push(
        {
          course_id: course3.id,
          title: 'Board of Directors',
          content: `# Board of Directors in Cooperatives\n\n## Composition\n\n- Elected by members at the **Annual General Meeting (AGM)**\n- Typically **7 to 15 members**\n- Must include reserved seats as per state law\n- Term usually **5 years**\n\n## Roles and Responsibilities\n\n1. **Policy Making**: Set strategic direction\n2. **Oversight**: Monitor management performance\n3. **Financial Stewardship**: Approve budgets and investments\n4. **Member Relations**: Address grievances\n5. **Compliance**: Ensure legal adherence\n\n## Key Positions\n\n| Position | Responsibility |\n|----------|---------------|\n| Chairperson | Presides over meetings, represents the cooperative |\n| Vice-Chairperson | Acts in absence of Chairperson |\n| Secretary | Manages records and correspondence |\n| Treasurer | Oversees financial management |\n\n## Good Governance Practices\n\n- Regular board meetings (at least quarterly)\n- Transparent decision-making\n- Conflict of interest policies\n- Training for board members\n- Performance evaluation`,
          order_index: 0,
          duration_minutes: 20,
        }
      );

      // Course 4: Digital Skills
      const course4 = insertedCourses[3];
      allModules.push(
        {
          course_id: course4.id,
          title: 'Getting Started with Digital Tools',
          content: `# Getting Started with Digital Tools\n\nThis module covers basic digital skills essential for cooperative members.\n\n## 1. Using a Computer\n\n- **Desktop vs Laptop vs Tablet**: Understanding devices\n- **Operating System**: Windows, Android basics\n- **Files and Folders**: Organizing your documents\n- **Internet Browser**: Chrome, Edge — navigating websites\n\n## 2. Digital Communication\n\n- **Email**: Creating an account, sending/receiving\n- **WhatsApp**: For cooperative group communication\n- **Video Calls**: Zoom/Meet for remote meetings\n\n## 3. Digital Payments\n\n- **UPI**: BHIM, Google Pay, PhonePe\n- **Net Banking**: Online transactions for cooperative accounts\n- **Digital Receipts**: Maintaining records\n\n## 4. Basic Office Tools\n\n- **Word Processing**: Writing reports and letters\n- **Spreadsheets**: Managing accounts and data\n- **Presentations**: For AGM presentations\n\n> **Tip**: Start with one tool at a time. Practice daily for 15 minutes to build confidence.`,
          order_index: 0,
          duration_minutes: 15,
        }
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await supabase.from('modules').upsert(allModules as any[], { onConflict: 'id' });
    }

    // ==========================================
    // SEED JOBS
    // ==========================================
    const jobs = [
      {
        title: 'Cooperative Society Manager',
        description: 'Lead and manage daily operations of a primary agricultural cooperative society. Responsible for member services, financial oversight, and regulatory compliance.',
        cooperative_name: 'Kisan Sahakari Samiti',
        skills_required: ['management', 'accounting', 'cooperative law', 'leadership'],
        location: 'Lucknow, Uttar Pradesh',
        salary_range: '₹25,000 - ₹40,000/month',
        job_type: 'full-time' as const,
        status: 'open' as const,
      },
      {
        title: 'Accounts Officer',
        description: 'Manage financial records, prepare balance sheets, and ensure compliance with audit requirements for a district-level cooperative bank.',
        cooperative_name: 'District Cooperative Bank',
        skills_required: ['accounting', 'tally', 'banking', 'audit'],
        location: 'Pune, Maharashtra',
        salary_range: '₹20,000 - ₹30,000/month',
        job_type: 'full-time' as const,
        status: 'open' as const,
      },
      {
        title: 'Digital Literacy Trainer',
        description: 'Conduct digital skills training programs for cooperative members across rural areas. Must be comfortable with travel and local language communication.',
        cooperative_name: 'NCCT Training Division',
        skills_required: ['digital literacy', 'training', 'communication', 'Hindi'],
        location: 'Pan India (Travel Required)',
        salary_range: '₹18,000 - ₹25,000/month',
        job_type: 'contract' as const,
        status: 'open' as const,
      },
      {
        title: 'IT Support Intern',
        description: 'Assist with deploying and maintaining digital tools for cooperative societies. Help train staff on ERP systems and maintain technical documentation.',
        cooperative_name: 'State Cooperative Union',
        skills_required: ['IT support', 'troubleshooting', 'documentation'],
        location: 'Remote / Hybrid',
        salary_range: '₹10,000 - ₹15,000/month',
        job_type: 'internship' as const,
        status: 'open' as const,
      },
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await supabase.from('jobs').upsert(jobs as any[], { onConflict: 'id' });

    // ==========================================
    // SEED RAG DOCUMENTS
    // ==========================================
    const documents = [
      {
        content: 'A cooperative society is a voluntary association of persons who come together for mutual economic benefit. The key principles include democratic member control (one member, one vote), open membership, limited return on capital, and distribution of surplus among members based on their participation. Cooperatives are governed by the Multi-State Cooperative Societies Act, 2002 for multi-state cooperatives, and respective State Cooperative Acts for single-state cooperatives.',
        source: 'Cooperative Fundamentals Guide',
        metadata: { topic: 'cooperative_basics' },
      },
      {
        content: 'The Ministry of Cooperation was established on July 6, 2021, by the Government of India. It aims to provide a separate administrative, legal, and policy framework for strengthening the cooperative movement in India. The ministry focuses on deepening cooperatives as grassroots organizations, streamlining processes for ease of doing business for cooperatives, and enabling the development of multi-state cooperatives.',
        source: 'Ministry of Cooperation Overview',
        metadata: { topic: 'government_policy' },
      },
      {
        content: 'The Multi-State Cooperative Societies Act, 2002 governs cooperative societies whose operations extend across multiple states. Key provisions include: minimum 50 members from each state for registration, a 5-year term for board of directors, mandatory annual general meetings, statutory audit by chartered accountants, and a dispute resolution mechanism through the Central Registrar. The act was amended in 2023 to improve transparency and accountability.',
        source: 'MSCS Act 2002 Summary',
        metadata: { topic: 'cooperative_law' },
      },
      {
        content: 'Financial management in cooperatives requires maintaining statutory reserve funds (minimum 25% of net profit), education funds (5% of net profit), and other reserves as mandated by bylaws. Cooperatives must undergo annual statutory audit conducted by auditors appointed by the Registrar of Cooperative Societies. The audit covers verification of cash and bank balances, member transactions, loan portfolios, and compliance with bylaws.',
        source: 'Cooperative Finance Handbook',
        metadata: { topic: 'accounting' },
      },
      {
        content: 'AMUL (Anand Milk Union Limited) is India\'s most successful cooperative, founded in 1946 in Anand, Gujarat. The AMUL model involves a three-tier structure: village-level dairy cooperative societies at the base, district-level milk unions in the middle, and a state-level federation at the top. This model has been replicated across India under Operation Flood and has made India the world\'s largest milk producer.',
        source: 'AMUL Case Study',
        metadata: { topic: 'cooperative_success_stories' },
      },
      {
        content: 'The National Cooperative Training Council (NCTC) is responsible for planning, organizing, and coordinating cooperative training programs in India. It operates through a network of training institutes across the country. Training programs cover cooperative management, accounting, legal compliance, digital literacy, and sector-specific skills for dairy, agriculture, housing, and credit cooperatives.',
        source: 'NCTC Training Programs',
        metadata: { topic: 'training' },
      },
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await supabase.from('documents').upsert(documents as any[], { onConflict: 'id' });

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      counts: {
        courses: courses.length,
        jobs: jobs.length,
        documents: documents.length,
      },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database', details: String(error) },
      { status: 500 }
    );
  }
}
