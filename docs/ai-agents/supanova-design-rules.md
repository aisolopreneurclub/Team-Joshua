# Supanova Design Rules (ERP 프로젝트 적용)

> 원본: https://github.com/uxjoseph/supanova-design-skill.git
> Next.js + shadcn/ui 환경에 맞게 변환한 디자인 가이드.
> 준호 봇에게 전달하여 대시보드/UI 구현 시 참조하도록 합니다.

---

## 오픈클로 투입용 프롬프트 (준호 봇 추가 지시)

```
@준호 UI 구현 시 아래 Supanova 디자인 규칙을 반드시 따르세요.
이 규칙은 $150k 에이전시 수준의 프리미엄 UI를 만들기 위한 것입니다.

## 1. 타이포그래피

### 한국어
- 헤드라인: text-4xl md:text-5xl lg:text-6xl tracking-tight leading-tight font-bold
- 본문: text-base md:text-lg text-gray-600 leading-relaxed
- 한국어 텍스트에 반드시 break-keep-all 적용 (단어 중간 줄바꿈 방지)
- leading-tight ~ leading-snug 사용 (leading-none 금지 — 한국어는 수직 여백 필요)

### 금지 폰트
- Inter, Noto Sans KR, Roboto, Arial, Open Sans 금지
- 기본 폰트: Pretendard (tailwind.config에서 설정)

## 2. 컬러

- 악센트 컬러: 페이지당 최대 1개
- 채도: 80% 미만 유지
- 금지: 보라/파랑 AI 그라디언트, 네온 글로우
- 다크모드 베이스: zinc-950, slate-950 (순수 #000000 금지, #0a0a0a 사용)
- 라이트모드: stone-50, slate-50 기반
- 한 페이지에서 warm/cool gray 혼용 금지

## 3. 레이아웃

### 금지 패턴
- 3열 동일 카드 행 금지 → Bento Grid 또는 비대칭 레이아웃 사용
- 인접 섹션이 동일한 레이아웃 패턴 사용 금지
- h-screen 금지 → min-h-[100dvh] 사용
- 컨텐츠 컨테이너: max-w-7xl mx-auto px-4 sm:px-6 lg:px-8

### 프리미엄 패턴
- 대시보드 위젯: Bento Grid (비대칭 카드 크기)
- 섹션 패딩: py-6 md:py-8 (대시보드는 컴팩트, 랜딩은 py-24)
- 반응형: 모바일 우선 (w-full px-4)

## 4. 카드 아키텍처 (Double-Bezel)

프리미엄 카드는 평면 사각형이 아님. 유리판이 알루미늄 트레이 위에 놓인 느낌:

```tsx
// 대시보드 위젯 카드
<div className="bg-white/5 ring-1 ring-white/10 p-1.5 rounded-2xl">
  <div className="bg-card rounded-[calc(1rem-0.375rem)] p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
    {/* 카드 내용 */}
  </div>
</div>

// shadcn/ui Card 커스텀 (라이트모드)
<Card className="ring-1 ring-black/5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
  <CardContent className="p-6">
    {/* 카드 내용 */}
  </CardContent>
</Card>
```

## 5. 버튼

- 모양: rounded-full (pill) + px-8 py-4
- 호버: hover:scale-[1.02] + 배경색 변화
- 클릭: active:scale-[0.98]
- 트랜지션: transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
- 화살표 아이콘: 둥근 원 안에 배치, 호버 시 translate-x-1

```tsx
<Button className="rounded-full px-8 py-4 text-lg transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.02] active:scale-[0.98]">
  시작하기
  <span className="ml-2 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
    <ArrowRight className="w-4 h-4" />
  </span>
</Button>
```

## 6. 모션/애니메이션

### 트랜지션 표준
모든 인터랙티브 요소:
```css
transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
```
linear, ease-in-out 금지.

### 스크롤 애니메이션
IntersectionObserver 사용. window.addEventListener('scroll') 금지.

```tsx
// 페이드인 애니메이션 (컴포넌트 진입 시)
const fadeInUp = {
  initial: { opacity: 0, y: '2rem', filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0)' },
}

// 연쇄 진입 (위젯 카드들)
// animation-delay: calc(var(--index) * 80ms)
```

### 성능 규칙
- transform과 opacity만 애니메이트 (top, left, width, height 금지)
- backdrop-blur는 fixed/sticky 요소에만
- 이미지: loading="lazy" + 폴드 아래만

## 7. 아이콘

- Lucide React 사용 (shadcn/ui 기본)
- 아이콘 스트로크: 일관된 굵기 유지
- 대시보드 위젯 아이콘: 배경 원 안에 배치

```tsx
<div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
  <ClipboardList className="w-5 h-5 text-blue-500" />
</div>
```

## 8. 대시보드 특화 규칙

### 위젯 그리드
```tsx
// Bento Grid (비대칭)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <div className="lg:col-span-2">큰 위젯 (오늘 현황)</div>
  <div>작은 위젯 (일정)</div>
  <div>작은 위젯 (태스크)</div>
  <div className="lg:col-span-2">중간 위젯 (팀 현황)</div>
  <div className="lg:col-span-2">중간 위젯 (최근 활동)</div>
</div>
```

### 숫자 표시
- 반올림 금지: 47,200+ (50,000+ 아님)
- 소수점: 4.87 (5.0 아님)
- 탭형 숫자: font-variant-numeric: tabular-nums

### 빈 상태
빈 위젯은 설명 텍스트 + 일러스트/아이콘:
```tsx
<div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
  <Calendar className="w-12 h-12 mb-4 opacity-30" />
  <p className="text-sm">오늘 예정된 일정이 없습니다</p>
</div>
```

### 사이드바
- 플로팅 스타일: 배경에서 살짝 분리 (ring-1 ring-border)
- 현재 경로: bg-accent/10 + text-accent (하이라이트)
- 섹션 구분: 미세한 라벨 (text-[11px] uppercase tracking-wider text-muted-foreground)
- 접기/펴기: smooth 트랜지션

## 9. 체크리스트 (민재 팀장 리뷰에 추가)

UI 리뷰 시 추가 확인:
- [ ] 금지 폰트 사용 없음
- [ ] 3열 동일 카드 사용 없음
- [ ] h-screen 사용 없음 (min-h-[100dvh])
- [ ] 한국어 텍스트에 break-keep-all 적용
- [ ] 버튼에 hover/active 상태 존재
- [ ] 트랜지션이 cubic-bezier 사용
- [ ] 카드가 flat하지 않음 (ring 또는 shadow 적용)
- [ ] 빈 상태 UI가 존재
- [ ] 숫자가 자연스러움 (반올림 아님)
```

---

## 적용 방법

1. 준호 봇의 SOUL.md에 "## 디자인 규칙" 섹션 추가하고 핵심 규칙 요약 삽입
2. 또는 Cycle 4~6 지시서에 "아래 디자인 규칙을 따르세요"로 이 내용 첨부
3. 민재 봇의 리뷰 체크리스트에 Section 9 항목 추가

## 투입 시점

| Cycle | Supanova 적용 | 이유 |
|-------|:---:|------|
| 1 Foundation | 부분 (레이아웃만) | Sidebar, Header에 프리미엄 스타일 |
| 2 HR 직원/부서 | O | 테이블, 폼, 조직도 UI |
| 3 HR 근태/휴가 | O | 카드, 폼 UI |
| 4 Calendar | O | FullCalendar 커스텀 스타일 |
| 5 Kanban | O | 칸반보드, 태스크 카드 핵심 |
| 6 Dashboard | **필수** | 대시보드 위젯 = 이 스킬의 핵심 적용처 |
