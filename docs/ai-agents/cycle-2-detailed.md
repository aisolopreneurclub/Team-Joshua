# Cycle 2: HR - 직원 & 부서 (상세 지시서)

> 오픈클로에 이 내용을 붙여넣으세요. 코드 스니펫을 그대로 사용하면 됩니다.

---

## 작업 지시

Cycle 2를 시작합니다. HR 모듈의 직원 관리와 부서 관리를 구현하세요.
아래 코드 템플릿을 기반으로 구현하되, TODO 부분만 채우면 됩니다.

---

## 1. Domain 타입

```typescript
// src/domain/hr/types.ts

export interface Employee {
  id: string
  userId: string
  employeeNo: string
  position: string
  phone: string | null
  hireDate: Date
  birthDate: Date | null
  address: string | null
  createdAt: Date
  updatedAt: Date
  user: {
    id: string
    email: string
    name: string
    role: Role
    avatar: string | null
  }
  departments: {
    department: Department
    isHead: boolean
  }[]
}

export interface Department {
  id: string
  name: string
  description: string | null
  parentId: string | null
  children?: Department[]
  members?: DepartmentMember[]
  _count?: { members: number }
}

export interface DepartmentMember {
  id: string
  departmentId: string
  employeeId: string
  isHead: boolean
  employee?: Employee
}

export type CreateEmployeeInput = {
  email: string
  name: string
  employeeNo: string
  position: string
  departmentId: string
  phone?: string
  hireDate: string
}

export type UpdateEmployeeInput = Partial<Omit<CreateEmployeeInput, 'email' | 'employeeNo'>>

export type CreateDepartmentInput = {
  name: string
  description?: string
  parentId?: string
}

export type EmployeeFilters = {
  departmentId?: string
  search?: string
  page?: number
  limit?: number
}
```

## 2. Zod Validation

```typescript
// src/lib/validations/employee.ts
import { z } from 'zod'

export const createEmployeeSchema = z.object({
  email: z.string().email('유효한 이메일을 입력하세요'),
  name: z.string().min(2, '이름은 2자 이상이어야 합니다'),
  employeeNo: z.string().regex(/^ASC-\d{4}-\d{3}$/, '사번 형식: ASC-YYYY-NNN'),
  position: z.string().min(1, '직급을 입력하세요'),
  departmentId: z.string().min(1, '부서를 선택하세요'),
  phone: z.string().regex(/^010-\d{4}-\d{4}$/, '전화번호 형식: 010-XXXX-XXXX').optional().or(z.literal('')),
  hireDate: z.string().min(1, '입사일을 입력하세요'),
})

export const updateEmployeeSchema = createEmployeeSchema
  .omit({ email: true, employeeNo: true })
  .partial()

export const createDepartmentSchema = z.object({
  name: z.string().min(1, '부서명을 입력하세요').max(50),
  description: z.string().max(200).optional(),
  parentId: z.string().optional(),
})
```

## 3. Repository 패턴

```typescript
// src/infrastructure/hr/EmployeeRepository.ts
import { prisma } from '@/infrastructure/db/prisma'
import type { EmployeeFilters } from '@/domain/hr/types'

export class EmployeeRepository {
  async findAll(filters: EmployeeFilters) {
    const { page = 1, limit = 20, departmentId, search } = filters
    const skip = (page - 1) * limit

    const where = {
      ...(departmentId && {
        departmentMembers: { some: { departmentId } },
      }),
      ...(search && {
        OR: [
          { user: { name: { contains: search, mode: 'insensitive' as const } } },
          { employeeNo: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    }

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: { select: { id: true, email: true, name: true, role: true, avatar: true } },
          departmentMembers: { include: { department: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.employee.count({ where }),
    ])

    return { employees, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findById(id: string) {
    return prisma.employee.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, name: true, role: true, avatar: true } },
        departmentMembers: { include: { department: true } },
      },
    })
  }

  async create(data: {
    userId: string
    employeeNo: string
    position: string
    phone?: string
    hireDate: Date
    departmentId: string
  }) {
    return prisma.$transaction(async (tx) => {
      const employee = await tx.employee.create({
        data: {
          userId: data.userId,
          employeeNo: data.employeeNo,
          position: data.position,
          phone: data.phone,
          hireDate: data.hireDate,
        },
      })

      await tx.departmentMember.create({
        data: {
          employeeId: employee.id,
          departmentId: data.departmentId,
        },
      })

      return this.findById(employee.id)
    })
  }

  async update(id: string, data: { position?: string; phone?: string }) {
    await prisma.employee.update({ where: { id }, data })
    return this.findById(id)
  }

  async delete(id: string) {
    // Employee + User 함께 삭제 (cascade로 처리되지만 명시적으로)
    const employee = await prisma.employee.findUnique({ where: { id } })
    if (!employee) return null

    await prisma.$transaction([
      prisma.departmentMember.deleteMany({ where: { employeeId: id } }),
      prisma.employee.delete({ where: { id } }),
      prisma.user.delete({ where: { id: employee.userId } }),
    ])

    return employee
  }
}

// src/infrastructure/hr/DepartmentRepository.ts
import { prisma } from '@/infrastructure/db/prisma'

export class DepartmentRepository {
  async findAll() {
    return prisma.department.findMany({
      include: {
        children: {
          include: {
            children: true,
            _count: { select: { members: true } },
          },
        },
        _count: { select: { members: true } },
      },
      where: { parentId: null }, // 최상위 부서만
      orderBy: { name: 'asc' },
    })
  }

  async findById(id: string) {
    return prisma.department.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            employee: {
              include: {
                user: { select: { name: true, email: true, role: true } },
              },
            },
          },
        },
        children: true,
        parent: true,
      },
    })
  }

  async create(data: { name: string; description?: string; parentId?: string }) {
    return prisma.department.create({ data })
  }

  async update(id: string, data: { name?: string; description?: string; parentId?: string }) {
    return prisma.department.update({ where: { id }, data })
  }

  async delete(id: string) {
    // 하위 부서가 있으면 삭제 불가
    const children = await prisma.department.count({ where: { parentId: id } })
    if (children > 0) {
      throw new Error('하위 부서가 있는 부서는 삭제할 수 없습니다')
    }
    return prisma.department.delete({ where: { id } })
  }
}
```

## 4. Service 레이어

```typescript
// src/application/hr/EmployeeService.ts
import { EmployeeRepository } from '@/infrastructure/hr/EmployeeRepository'
import { prisma } from '@/infrastructure/db/prisma'
import { hash } from 'bcryptjs'
import type { CreateEmployeeInput, UpdateEmployeeInput, EmployeeFilters } from '@/domain/hr/types'

const repo = new EmployeeRepository()

export class EmployeeService {
  async getEmployees(filters: EmployeeFilters) {
    return repo.findAll(filters)
  }

  async getEmployeeById(id: string) {
    const employee = await repo.findById(id)
    if (!employee) throw new Error('직원을 찾을 수 없습니다')
    return employee
  }

  async createEmployee(input: CreateEmployeeInput) {
    // 이메일 중복 체크
    const existing = await prisma.user.findUnique({ where: { email: input.email } })
    if (existing) throw new Error('이미 등록된 이메일입니다')

    // 사번 중복 체크
    const existingNo = await prisma.employee.findUnique({ where: { employeeNo: input.employeeNo } })
    if (existingNo) throw new Error('이미 등록된 사번입니다')

    // User 생성 (초기 비밀번호: 사번)
    const user = await prisma.user.create({
      data: {
        email: input.email,
        name: input.name,
        password: await hash(input.employeeNo, 12),
        role: 'EMPLOYEE',
      },
    })

    return repo.create({
      userId: user.id,
      employeeNo: input.employeeNo,
      position: input.position,
      phone: input.phone,
      hireDate: new Date(input.hireDate),
      departmentId: input.departmentId,
    })
  }

  async updateEmployee(id: string, input: UpdateEmployeeInput) {
    return repo.update(id, {
      position: input.position,
      phone: input.phone,
    })
  }

  async deleteEmployee(id: string) {
    const result = await repo.delete(id)
    if (!result) throw new Error('직원을 찾을 수 없습니다')
    return result
  }
}

// src/application/hr/DepartmentService.ts
import { DepartmentRepository } from '@/infrastructure/hr/DepartmentRepository'
import type { CreateDepartmentInput } from '@/domain/hr/types'

const repo = new DepartmentRepository()

export class DepartmentService {
  async getDepartmentTree() {
    return repo.findAll()
  }

  async getDepartmentById(id: string) {
    const dept = await repo.findById(id)
    if (!dept) throw new Error('부서를 찾을 수 없습니다')
    return dept
  }

  async createDepartment(input: CreateDepartmentInput) {
    return repo.create(input)
  }

  async updateDepartment(id: string, input: Partial<CreateDepartmentInput>) {
    return repo.update(id, input)
  }

  async deleteDepartment(id: string) {
    return repo.delete(id)
  }
}
```

## 5. API Routes

```typescript
// app/api/v1/employees/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { EmployeeService } from '@/application/hr/EmployeeService'
import { createEmployeeSchema } from '@/lib/validations/employee'
import { createApiError } from '@/lib/errors'

const service = new EmployeeService()

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return createApiError('UNAUTHORIZED', '로그인이 필요합니다')

  const { searchParams } = new URL(req.url)
  const filters = {
    page: Number(searchParams.get('page')) || 1,
    limit: Number(searchParams.get('limit')) || 20,
    departmentId: searchParams.get('departmentId') || undefined,
    search: searchParams.get('search') || undefined,
  }

  try {
    const result = await service.getEmployees(filters)
    return NextResponse.json(result)
  } catch (error) {
    return createApiError('INTERNAL_ERROR', '직원 목록 조회 실패')
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return createApiError('UNAUTHORIZED', '로그인이 필요합니다')
  if (session.user.role !== 'ADMIN') return createApiError('FORBIDDEN', '관리자만 등록할 수 있습니다')

  try {
    const body = await req.json()
    const parsed = createEmployeeSchema.safeParse(body)
    if (!parsed.success) {
      return createApiError('BAD_REQUEST', '입력값이 올바르지 않습니다',
        Object.fromEntries(parsed.error.issues.map(i => [i.path.join('.'), [i.message]])))
    }

    const employee = await service.createEmployee(parsed.data)
    return NextResponse.json(employee, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : '직원 등록 실패'
    return createApiError('BAD_REQUEST', message)
  }
}

// app/api/v1/employees/[id]/route.ts
// GET, PUT, DELETE 동일 패턴으로 구현
// PUT: Admin 또는 본인만 수정 가능
// DELETE: Admin만 삭제 가능

// app/api/v1/departments/route.ts
// app/api/v1/departments/[id]/route.ts
// 동일 패턴. Admin만 생성/수정/삭제 가능.
```

## 6. UI 컴포넌트

```tsx
// src/presentation/hr/EmployeeTable.tsx
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/presentation/components/ui/table'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/presentation/components/ui/select'
import { Dialog, DialogTrigger } from '@/presentation/components/ui/dialog'
import { EmployeeForm } from './EmployeeForm'
import { format } from 'date-fns'
import type { Employee, EmployeeFilters } from '@/domain/hr/types'

// TODO: 이 구조를 기반으로 완성하세요
// - useQuery로 /api/v1/employees 호출
// - 부서 필터 Select
// - 검색 Input
// - 페이지네이션 버튼
// - [+ 직원 추가] 버튼 → Dialog 안에 EmployeeForm
// - 행 클릭 → /hr/employees/[id]로 이동

// src/presentation/hr/EmployeeForm.tsx
// react-hook-form + zod resolver 사용
// isEdit prop으로 생성/수정 모드 분기
// useMutation으로 POST 또는 PUT 호출
// 성공 시 toast + queryClient.invalidateQueries

// src/presentation/hr/OrgChart.tsx
// 부서 트리를 재귀 컴포넌트로 렌더링
// 각 노드: 부서명 + 직원 수 + 펼치기/접기
// 부서 클릭 → 소속 직원 목록 표시
```

## 7. 페이지

```tsx
// app/(main)/hr/employees/page.tsx
import { EmployeeTable } from '@/presentation/hr/EmployeeTable'

export default function EmployeesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">직원 관리</h1>
      </div>
      <EmployeeTable />
    </div>
  )
}

// app/(main)/hr/employees/[id]/page.tsx
// 직원 상세 페이지: 프로필 카드 + 수정 버튼

// app/(main)/hr/org-chart/page.tsx
// 조직도 페이지: OrgChart 컴포넌트 렌더링
```

---

구현 완료 후 리뷰 보고서를 작성해 주세요.
