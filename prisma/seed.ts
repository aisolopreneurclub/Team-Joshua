import { PrismaClient, Role } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Admin 유저 생성
  const adminPassword = await bcrypt.hash("admin1234", 12)
  const admin = await prisma.user.upsert({
    where: { email: "admin@asc.com" },
    update: {},
    create: {
      email: "admin@asc.com",
      name: "관리자",
      password: adminPassword,
      role: Role.ADMIN,
    },
  })

  // 매니저 유저 생성
  const managerPassword = await bcrypt.hash("manager1234", 12)
  const manager = await prisma.user.upsert({
    where: { email: "manager@asc.com" },
    update: {},
    create: {
      email: "manager@asc.com",
      name: "홍길동",
      password: managerPassword,
      role: Role.MANAGER,
    },
  })

  // 일반 직원 유저 생성
  const employeePassword = await bcrypt.hash("employee1234", 12)
  const employee = await prisma.user.upsert({
    where: { email: "employee@asc.com" },
    update: {},
    create: {
      email: "employee@asc.com",
      name: "김철수",
      password: employeePassword,
      role: Role.EMPLOYEE,
    },
  })

  // 부서 생성
  const devDept = await prisma.department.upsert({
    where: { name: "개발팀" },
    update: {},
    create: { name: "개발팀", description: "소프트웨어 개발" },
  })

  const designDept = await prisma.department.upsert({
    where: { name: "디자인팀" },
    update: {},
    create: { name: "디자인팀", description: "UI/UX 디자인" },
  })

  const bizDept = await prisma.department.upsert({
    where: { name: "경영지원팀" },
    update: {},
    create: { name: "경영지원팀", description: "경영 지원 및 총무" },
  })

  // 직원 프로필 생성
  await prisma.employee.upsert({
    where: { userId: manager.id },
    update: {},
    create: {
      userId: manager.id,
      employeeNo: "ASC-2024-001",
      position: "팀장",
      phone: "010-1234-5678",
      hireDate: new Date("2024-01-02"),
    },
  })

  await prisma.employee.upsert({
    where: { userId: employee.id },
    update: {},
    create: {
      userId: employee.id,
      employeeNo: "ASC-2025-001",
      position: "시니어 개발자",
      phone: "010-9876-5432",
      hireDate: new Date("2025-03-01"),
    },
  })

  // 칸반 보드 생성
  const board = await prisma.board.create({
    data: {
      name: "ERP 프로젝트",
      description: "사내 ERP 시스템 개발 프로젝트",
      columns: {
        create: [
          { name: "To Do", order: 0, color: "#6B7280" },
          { name: "In Progress", order: 1, color: "#3B82F6" },
          { name: "Review", order: 2, color: "#F59E0B" },
          { name: "Done", order: 3, color: "#10B981" },
        ],
      },
    },
  })

  // 회의실 생성
  await prisma.meetingRoom.createMany({
    data: [
      {
        name: "회의실 A",
        floor: "3층",
        capacity: 8,
        equipment: ["프로젝터", "화이트보드"],
      },
      {
        name: "회의실 B",
        floor: "3층",
        capacity: 4,
        equipment: ["모니터"],
      },
      {
        name: "대회의실",
        floor: "5층",
        capacity: 20,
        equipment: ["프로젝터", "화이트보드", "화상회의 장비"],
      },
    ],
    skipDuplicates: true,
  })

  // 라벨 생성
  await prisma.label.createMany({
    data: [
      { name: "버그", color: "#EF4444" },
      { name: "기능", color: "#3B82F6" },
      { name: "개선", color: "#10B981" },
      { name: "긴급", color: "#F59E0B" },
      { name: "문서", color: "#8B5CF6" },
    ],
    skipDuplicates: true,
  })

  console.log("Seed completed:")
  console.log(`  Users: admin(${admin.id}), manager(${manager.id}), employee(${employee.id})`)
  console.log(`  Departments: ${devDept.name}, ${designDept.name}, ${bizDept.name}`)
  console.log(`  Board: ${board.name}`)
  console.log("  Meeting rooms: 3")
  console.log("  Labels: 5")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
