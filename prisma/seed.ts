import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { seedCore, seedUser } from "./lib/seed-core";
import { requireDatabaseUrl } from "./lib/require-database-url";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: requireDatabaseUrl() }) });

/** รหัสผ่านทุกบัญชีตัวอย่าง */
export const DEV_PASSWORD = "Passw0rd!vibe";

async function main() {
  if (process.env.NODE_ENV === "production" && process.env.SEED_ALLOW_PROD !== "1") {
    console.error("[seed] ปฏิเสธ: NODE_ENV=production — ใช้ npm run db:bootstrap แทน");
    process.exit(1);
  }
  const core = await seedCore(prisma, { tenantCode: "DEMO", nameTh: "องค์กรตัวอย่าง", nameEn: "Sample Organization" });
  const hash = await bcrypt.hash(DEV_PASSWORD, 12);
  const users = [
    { email: "admin@app.local", name: "ผู้ดูแลสูงสุด", roles: ["SUPER_ADMIN"] },
    { email: "staff@app.local", name: "เจ้าหน้าที่", roles: ["STAFF"] },
    { email: "viewer@app.local", name: "ผู้ดู", roles: ["VIEWER"] },
    { email: "lockme@app.local", name: "บัญชีทดสอบล็อก", roles: ["VIEWER"] },
    { email: "forced@app.local", name: "บัญชีบังคับเปลี่ยนรหัส", roles: ["VIEWER"], mustChangePassword: true },
  ];
  for (const u of users) {
    await seedUser(prisma, core.tenantId, { ...u, passwordHash: hash, roleIds: u.roles.map((c) => core.roleIds[c]) });
  }

  await prisma.newsArticle.upsert({
    where: { tenantId_slug: { tenantId: core.tenantId, slug: "open-house-2026" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      title: "ขอเชิญร่วมงานเปิดบ้านคณะ ประจำปี 2569",
      slug: "open-house-2026",
      summary: "พบกับนิทรรศการแสดงผลงานนวัตกรรม แนะนำหลักสูตรการศึกษา และกิจกรรม Workshop มากมาย",
      content: "ขอเชิญชวนนักเรียน ผู้ปกครอง และผู้สนใจทุกท่าน เข้าร่วมกิจกรรมเปิดบ้านคณะ (Open House 2026) ภายในงานประกอบด้วยกิจกรรมที่น่าสนใจมากมาย อาทิ การบรรยายแนะนำหลักสูตร นิทรรศการผลงานวิจัย และ Workshop ปฏิบัติการจริง",
      coverImage: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80",
      category: "EVENT",
      status: "PUBLISHED",
      isPinned: true,
      publishedAt: new Date(),
    },
  });

  await prisma.newsArticle.upsert({
    where: { tenantId_slug: { tenantId: core.tenantId, slug: "scholarship-term-1-2569" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      title: "ประกาศรับสมัครทุนการศึกษา ประจำภาคการศึกษาที่ 1/2569",
      slug: "scholarship-term-1-2569",
      summary: "คณะเปิดรับสมัครทุนการศึกษาสำหรับนิสิตที่มีผลการเรียนดีเด่น และทุนช่วยเหลือนิสิตที่ขาดแคลนทุนทรัพย์ รวมกว่า 50 ทุน",
      content: "งานกิจการนิสิต ขอประกาศรับสมัครทุนการศึกษา ประจำภาคการศึกษาที่ 1/2569 นิสิตสามารถยื่นเอกสารการสมัครผ่านระบบบริการนิสิตออนไลน์ได้ตั้งแต่วันนี้เป็นต้นไป",
      coverImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&auto=format&fit=crop&q=80",
      category: "SCHOLARSHIP",
      status: "PUBLISHED",
      isPinned: false,
      publishedAt: new Date(),
    },
  });

  const deptCpe = await prisma.department.upsert({
    where: { tenantId_code: { tenantId: core.tenantId, code: "CPE" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      code: "CPE",
      nameTh: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
      nameEn: "Department of Computer Engineering",
    },
  });

  const deptEe = await prisma.department.upsert({
    where: { tenantId_code: { tenantId: core.tenantId, code: "EE" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      code: "EE",
      nameTh: "ภาควิชาวิศวกรรมไฟฟ้า",
      nameEn: "Department of Electrical Engineering",
    },
  });

  await prisma.staffProfile.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      tenantId: core.tenantId,
      departmentId: deptCpe.id,
      staffType: "ACADEMIC",
      academicTitle: "รศ.ดร.",
      firstNameTh: "วิริยะ",
      lastNameTh: "เทคโนโลยี",
      firstNameEn: "Viriya",
      lastNameEn: "Technology",
      position: "หัวหน้าภาควิชาวิศวกรรมคอมพิวเตอร์",
      email: "viriya.t@eng.ac.th",
      phone: "02-123-4567 ต่อ 101",
      officeRoom: "อาคาร 3 ชั้น 4 ห้อง 3401",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
      education: "วศ.ด. (วิศวกรรมคอมพิวเตอร์) มหาวิทยาลัยเทคโนโลยีแห่งชาติ\nM.S. in Computer Science, Stanford University",
      expertise: "Artificial Intelligence, Deep Learning, Cloud Computing, Distributed Systems",
      orderIndex: 1,
      isActive: true,
    },
  });

  await prisma.staffProfile.upsert({
    where: { id: "00000000-0000-0000-0000-000000000002" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000002",
      tenantId: core.tenantId,
      departmentId: deptEe.id,
      staffType: "ACADEMIC",
      academicTitle: "ผศ.ดร.",
      firstNameTh: "กิตติพงษ์",
      lastNameTh: "พลังงานสะอาด",
      firstNameEn: "Kittipong",
      lastNameEn: "Cleanpower",
      position: "อาจารย์ประจำภาควิชาวิศวกรรมไฟฟ้า",
      email: "kittipong.c@eng.ac.th",
      phone: "02-123-4567 ต่อ 205",
      officeRoom: "อาคาร 2 ชั้น 3 ห้อง 2305",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80",
      education: "Ph.D. in Electrical Engineering, Imperial College London\nวศ.บ. (วิศวกรรมไฟฟ้าเกียรตินิยมอันดับหนึ่ง)",
      expertise: "Smart Grid, Renewable Energy, Power Electronics, Energy Storage Systems",
      orderIndex: 2,
      isActive: true,
    },
  });

  await prisma.curriculumProgram.upsert({
    where: { id: "00000000-0000-0000-0000-000000000011" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000011",
      tenantId: core.tenantId,
      departmentId: deptCpe.id,
      code: "CPE-BENG",
      nameTh: "หลักสูตรวิศวกรรมศาสตรบัณฑิต สาขาวิชาวิศวกรรมคอมพิวเตอร์",
      nameEn: "Bachelor of Engineering Program in Computer Engineering",
      degreeTitleTh: "วศ.บ. (วิศวกรรมคอมพิวเตอร์)",
      degreeTitleEn: "B.Eng. (Computer Engineering)",
      level: "BACHELOR",
      totalCredits: 136,
      durationYears: 4,
      tuitionFeePerTerm: 25000,
      overview: "มุ่งเน้นการผลิตวิศวกรคอมพิวเตอร์ที่มีความรู้ความเชี่ยวชาญทั้งด้านฮาร์ดแวร์ ซอฟต์แวร์ เครือข่าย และปัญญาประดิษฐ์ พร้อมรับมือกับความท้าทายในยุคเศรษฐกิจดิจิทัลระดับสากล",
      careerPaths: "Software Engineer, DevOps & Platform Engineer, Full-Stack Developer, AI/ML Engineer, Embedded Systems Specialist, Cybersecurity Consultant",
      studyPlan: "ชั้นปีที่ 1: พื้นฐานคณิตศาสตร์ วิทยาศาสตร์ และการเขียนโปรแกรมเชิงโครงสร้าง\nชั้นปีที่ 2: โครงสร้างข้อมูล อัลกอริทึม สถาปัตยกรรมคอมพิวเตอร์ และระบบฐานข้อมูล\nชั้นปีที่ 3: ระบบคลาวด์ วิศวกรรมซอฟต์แวร์ เครือข่าย และปัญญาประดิษฐ์เบื้องต้น\nชั้นปีที่ 4: สหกิจศึกษาในสถานประกอบการชั้นนำ และโครงงานวิศวกรรมคอมพิวเตอร์ขั้นสูง",
      coverImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80",
      isActive: true,
    },
  });

  await prisma.curriculumProgram.upsert({
    where: { id: "00000000-0000-0000-0000-000000000012" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000012",
      tenantId: core.tenantId,
      departmentId: deptCpe.id,
      code: "AI-MENG",
      nameTh: "หลักสูตรวิศวกรรมศาสตรมหาบัณฑิต สาขาวิชาวิศวกรรมปัญญาประดิษฐ์และวิทยาศาสตร์ข้อมูล",
      nameEn: "Master of Engineering Program in Artificial Intelligence and Data Science",
      degreeTitleTh: "วศ.ม. (วิศวกรรมปัญญาประดิษฐ์และวิทยาศาสตร์ข้อมูล)",
      degreeTitleEn: "M.Eng. (Artificial Intelligence and Data Science)",
      level: "MASTER",
      totalCredits: 36,
      durationYears: 2,
      tuitionFeePerTerm: 45000,
      overview: "หลักสูตรระดับบัณฑิตศึกษาเพื่อสร้างนักวิจัยและผู้เชี่ยวชาญระดับสูงด้าน Deep Learning, Large Language Models, MLOps และ Big Data Analytics",
      careerPaths: "Chief AI Architect, Lead Data Scientist, Machine Learning Researcher, Quantitative Analyst",
      studyPlan: "ปีที่ 1: Advanced Machine Learning, Deep Neural Architectures, Big Data Systems\nปีที่ 2: วิทยานิพนธ์ (Thesis) และการตีพิมพ์บทความวิจัยระดับนานาชาติ",
      coverImage: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200&auto=format&fit=crop&q=80",
      isActive: true,
    },
  });

  await prisma.curriculumProgram.upsert({
    where: { id: "00000000-0000-0000-0000-000000000013" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000013",
      tenantId: core.tenantId,
      departmentId: deptEe.id,
      code: "EE-PHD",
      nameTh: "หลักสูตรปรัชญาดุษฎีบัณฑิต สาขาวิชาวิศวกรรมไฟฟ้าและระบบพลังงานอัจฉริยะ",
      nameEn: "Doctor of Philosophy Program in Electrical and Smart Energy Systems",
      degreeTitleTh: "ปร.ด. (วิศวกรรมไฟฟ้าและระบบพลังงานอัจฉริยะ)",
      degreeTitleEn: "Ph.D. (Electrical and Smart Energy Systems)",
      level: "DOCTORAL",
      totalCredits: 48,
      durationYears: 3,
      tuitionFeePerTerm: 50000,
      overview: "มุ่งเน้นการสร้างสรรค์นวัตกรรมและองค์ความรู้ใหม่ระดับโลกด้านระบบโครงข่ายไฟฟ้าอัจฉริยะ (Smart Grid), เทคโนโลยีพลังงานหมุนเวียน และยานยนต์ไฟฟ้า (EV)",
      careerPaths: "University Professor, Principal Research Scientist, Energy Policy Advisor, R&D Director",
      studyPlan: "ปีที่ 1: ดุษฎีนิพนธ์หัวข้อเฉพาะทางและการสอบวัดคุณสมบัติ (Qualifying Exam)\nปีที่ 2-3: ดุษฎีนิพนธ์ขั้นสูงและการตีพิมพ์วารสารวิชาการระดับ Q1/Q2",
      coverImage: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1200&auto=format&fit=crop&q=80",
      isActive: true,
    },
  });

  const adminUser = await prisma.user.findUnique({ where: { email: "admin@app.local" } });
  const viewerUser = await prisma.user.findUnique({ where: { email: "viewer@app.local" } });

  if (adminUser && viewerUser) {
    const doc1 = await prisma.documentRequest.upsert({
      where: { id: "00000000-0000-0000-0000-000000000021" },
      update: {},
      create: {
        id: "00000000-0000-0000-0000-000000000021",
        tenantId: core.tenantId,
        trackingCode: "REQ-202609-0001",
        documentType: "COURSE_ADD",
        title: "ขอเปิดรายวิชาเพิ่ม CPE-491 AI Engineering",
        reason: "ต้องการลงทะเบียนเรียนเพื่อสำเร็จการศึกษาในภาคการศึกษานี้ตามแผนการเรียน",
        formData: { courseCode: "CPE-491", section: "1" },
        status: "APPROVED",
        currentStep: 2,
        requesterId: viewerUser.id,
      },
    });

    await prisma.documentApproval.upsert({
      where: { id: "00000000-0000-0000-0000-000000000022" },
      update: {},
      create: {
        id: "00000000-0000-0000-0000-000000000022",
        tenantId: core.tenantId,
        documentId: doc1.id,
        step: 1,
        decision: "APPROVED",
        comment: "อนุมัติเปิดกลุ่มเรียนเพิ่มเติมตามคำร้องของนิสิต",
        reviewerId: adminUser.id,
      },
    });

    await prisma.documentRequest.upsert({
      where: { id: "00000000-0000-0000-0000-000000000023" },
      update: {},
      create: {
        id: "00000000-0000-0000-0000-000000000023",
        tenantId: core.tenantId,
        trackingCode: "REQ-202609-0002",
        documentType: "LEAVE_ABSENCE",
        title: "ขอลาพักการศึกษาเพื่อฝึกงานต่างประเทศ 1 ภาคการศึกษา",
        reason: "ได้รับคัดเลือกเข้าร่วมโครงการฝึกงานวิจัย ณ สถาบันวิจัยชั้นนำ ประเทศญี่ปุ่น เป็นเวลา 4 เดือน",
        formData: { country: "Japan", periodMonths: 4 },
        status: "IN_REVIEW",
        currentStep: 1,
        requesterId: viewerUser.id,
      },
    });

    const room1 = await prisma.meetingRoom.upsert({
      where: { id: "00000000-0000-0000-0000-000000000031" },
      update: {},
      create: {
        id: "00000000-0000-0000-0000-000000000031",
        tenantId: core.tenantId,
        code: "ENG-3401",
        nameTh: "ห้องประชุมวิริยะวิจิตร (ห้องผู้บริหาร)",
        nameEn: "Viriya Executive Conference Room",
        building: "อาคาร 3 วิศวกรรมศาสตร์",
        floor: "ชั้น 4",
        capacity: 30,
        amenities: "ระบบ Zoom Room Certified, ไมโครโฟนไร้สาย 4 ตัว, จอโปรเจกเตอร์ 4K, กระดาน Smart Board",
        coverImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80",
        status: "AVAILABLE",
      },
    });

    await prisma.meetingRoom.upsert({
      where: { id: "00000000-0000-0000-0000-000000000032" },
      update: {},
      create: {
        id: "00000000-0000-0000-0000-000000000032",
        tenantId: core.tenantId,
        code: "ENG-2201",
        nameTh: "ห้องประชุมสัมมนาพลังงานและสิ่งแวดล้อม",
        nameEn: "Energy & Environment Seminar Hall",
        building: "อาคาร 2 นวัตกรรม",
        floor: "ชั้น 2",
        capacity: 60,
        amenities: "ระบบ Hybrid Conference, ระบบเสียงรอบทิศทาง, เวทีวิทยากร, จอ LED ขนาดใหญ่",
        coverImage: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=1200&auto=format&fit=crop&q=80",
        status: "AVAILABLE",
      },
    });

    await prisma.roomBooking.upsert({
      where: { id: "00000000-0000-0000-0000-000000000033" },
      update: {},
      create: {
        id: "00000000-0000-0000-0000-000000000033",
        tenantId: core.tenantId,
        roomId: room1.id,
        bookedById: viewerUser.id,
        title: "การประชุมคณะกรรมการพัฒนาหลักสูตรวิศวกรรมคอมพิวเตอร์",
        purpose: "พิจารณาเกณฑ์ มคอ. และการประเมินคุณภาพการศึกษา AUN-QA",
        attendeeCount: 15,
        equipmentRequested: "ไมโครโฟนตั้งโต๊ะ และระบบ Zoom Meeting",
        startTime: new Date(Date.now() + 86400000 * 2), // 2 days from now
        endTime: new Date(Date.now() + 86400000 * 2 + 7200000), // +2 hours
        status: "CONFIRMED",
        reviewNote: "อนุมัติการใช้งานห้องประชุมตามที่ขอ",
      },
    });

    const certType1 = await prisma.serviceType.upsert({
      where: { tenantId_code: { tenantId: core.tenantId, code: "CERT-ENROLL" } },
      update: {},
      create: {
        id: "00000000-0000-0000-0000-000000000041",
        tenantId: core.tenantId,
        code: "CERT-ENROLL",
        category: "STUDENT_STATUS",
        nameTh: "หนังสือรับรองสถานภาพการเป็นนิสิต (ฉบับภาษาไทย/อังกฤษ)",
        nameEn: "Certificate of Student Status (TH/EN)",
        description: "เอกสารรับรองการลงทะเบียนเรียนและสถานภาพนิสิตปัจจุบัน สำหรับยื่นขอวีซ่า สมัครทุน หรือหน่วยงานภายนอก",
        fee: 50,
        processingDays: 2,
        requiredDocs: "สำเนาบัตรประชาชน / สำเนาบัตรประจำตัวนิสิต",
        isActive: true,
      },
    });

    await prisma.serviceType.upsert({
      where: { tenantId_code: { tenantId: core.tenantId, code: "CERT-CONDUCT" } },
      update: {},
      create: {
        id: "00000000-0000-0000-0000-000000000042",
        tenantId: core.tenantId,
        code: "CERT-CONDUCT",
        category: "CONDUCT",
        nameTh: "หนังสือรับรองความประพฤติและวินัยนิสิต",
        nameEn: "Certificate of Good Conduct",
        description: "เอกสารรับรองว่าไม่เคยถูกลงโทษทางวินัยนิสิต ออกโดยฝ่ายกิจการนิสิต",
        fee: 0,
        processingDays: 3,
        requiredDocs: "ไม่มี",
        isActive: true,
      },
    });

    await prisma.serviceType.upsert({
      where: { tenantId_code: { tenantId: core.tenantId, code: "CERT-INTERN" } },
      update: {},
      create: {
        id: "00000000-0000-0000-0000-000000000043",
        tenantId: core.tenantId,
        code: "CERT-INTERN",
        category: "INTERNSHIP",
        nameTh: "หนังสือขอความอนุเคราะห์ฝึกงาน / สหกิจศึกษา",
        nameEn: "Internship & Co-op Recommendation Letter",
        description: "หนังสืออย่างเป็นทางการของคณะถึงสถานประกอบการเพื่อขอส่งนิสิตเข้ารับการฝึกประสบการณ์วิชาชีพ",
        fee: 0,
        processingDays: 5,
        requiredDocs: "รายละเอียดสถานประกอบการ และหนังสือตอบรับเบื้องต้น",
        isActive: true,
      },
    });

    // Sample issued and verified certificate
    await prisma.serviceRequest.upsert({
      where: { id: "00000000-0000-0000-0000-000000000044" },
      update: {},
      create: {
        id: "00000000-0000-0000-0000-000000000044",
        tenantId: core.tenantId,
        serviceTypeId: certType1.id,
        requesterId: viewerUser.id,
        trackingCode: "SR-202609-0001",
        deliveryMethod: "BOTH",
        status: "APPROVED",
        studentCode: "65010999",
        studentName: "นายทดสอบ วิศวกรรมศาสตร์",
        facultyMajor: "วิศวกรรมคอมพิวเตอร์ (Computer Engineering)",
        reason: "ใช้ยื่นสมัครขอรับทุนการศึกษาต่อต่างประเทศ",
        copiesCount: 2,
        certificateNumber: "CERT-202609-0001",
        verificationHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        issuedAt: new Date(),
        expiresAt: new Date(Date.now() + 86400000 * 365),
        issuerName: "ดร.สมศักดิ์ รักการสอน (คณบดี/นายทะเบียน)",
        pickupDate: new Date(Date.now() + 86400000 * 2),
        pickupLocation: "ห้องงานบริการการศึกษา อาคาร 1 ชั้น 2",
        reviewNote: "ตรวจสอบคุณสมบัติและผลการเรียนเรียบร้อย ออกหนังสือรับรองฉบับดิจิทัลและพิมพ์ฉบับจริงพร้อมรับ",
      },
    });

    // Sample Attendance Session with PIN 8842
    const session1 = await prisma.attendanceSession.upsert({
      where: { id: "00000000-0000-0000-0000-000000000051" },
      update: {},
      create: {
        id: "00000000-0000-0000-0000-000000000051",
        tenantId: core.tenantId,
        lecturerId: adminUser.id,
        courseCode: "CPE-301",
        courseName: "Software Engineering & Architecture",
        title: "บทที่ 5: Modular Monolith และ Next.js 16 App Router",
        roomNumber: "ENG-3401",
        sessionDate: new Date(),
        startTime: new Date(),
        endTime: new Date(Date.now() + 10800000), // +3 hours
        checkInPin: "8842",
        qrToken: "qr-cpe301-live-session",
        lateThresholdMinutes: 15,
        status: "ACTIVE",
      },
    });

    await prisma.attendanceRecord.upsert({
      where: {
        sessionId_studentId: {
          sessionId: session1.id,
          studentId: viewerUser.id,
        },
      },
      update: {},
      create: {
        id: "00000000-0000-0000-0000-000000000052",
        tenantId: core.tenantId,
        sessionId: session1.id,
        studentId: viewerUser.id,
        studentName: "นายทดสอบ วิศวกรรมศาสตร์",
        studentCode: "65010999",
        checkInTime: new Date(),
        status: "PRESENT",
        method: "PIN",
        note: "เช็คชื่อผ่านระบบ Fast Check-in",
      },
    });
  }

  console.log(`[seed] เสร็จ — login: admin@app.local / ${DEV_PASSWORD}`);
}

main().finally(() => prisma.$disconnect());
