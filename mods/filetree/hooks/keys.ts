import type { RowSpec } from './rows'

export type ShortcutKey = { key: string; label: string; terminal?: true }
export type ShortcutGroup = { title: string; keys: ShortcutKey[] }

const GROUPS: readonly ShortcutGroup[] = [
  {
    title: '이동',
    keys: [
      { key: 'j / k', label: '아래 / 위' },
      { key: 'h / l', label: '접기 또는 상위 / 펼치기' },
      { key: 'o, Enter', label: '파일 열기 또는 폴더 전환' },
      { key: 'z', label: '폴더로 이동' },
      { key: 'Space', label: 'macOS 퀵 룩', terminal: true },
    ],
  },
  {
    title: '검색',
    keys: [
      { key: 's', label: '검색창에 포커스' },
      { key: 'i', label: '커서 아래 폴더에서 검색' },
      { key: 'c / r', label: '대소문자 구분 / 정규식' },
      { key: 'q', label: '파일명 대신 내용 검색' },
    ],
  },
  {
    title: '파일과 동작',
    keys: [
      { key: 'd', label: '차이' },
      { key: 'click', label: '한 행 선택' },
      { key: 'ctrl+click', label: '행 추가 또는 해제; macOS에서는 alt+click' },
      { key: 'shift+click', label: '기준점부터 범위 선택' },
      { key: 'shift+j / k', label: '선택 범위를 아래 / 위로 확장' },
      { key: 'v / V', label: '행 추가 또는 해제 / 표시 지우기' },
      { key: 'y / Y', label: '상대 / 절대 경로 복사' },
      { key: 'u', label: '이름 복사' },
      { key: 't', label: 'tmux 또는 herdr 패널에서 셸 열기' },
      { key: 'x', label: "Claude의 편집으로부터 보호" },
      { key: 'w', label: '저장소 밖에 기록된 파일' },
    ],
  },
  {
    title: '보기',
    keys: [
      { key: 'p', label: '미리보기 또는 트리맵', terminal: true },
      { key: 'f / b', label: '미리보기 페이지 이동', terminal: true },
      { key: '[ / ]', label: '이전 / 다음 PDF 또는 Word 페이지', terminal: true },
      { key: 'a', label: '자동 접기' },
      { key: 'n / g / m', label: '이름 / git / 값으로 정렬' },
    ],
  },
  {
    title: '패널',
    keys: [
      { key: '?', label: '이 목록 표시 또는 숨기기', terminal: true },
      { key: 'ctrl+x tab', label: '패널에 키보드 포커스', terminal: true },
      { key: 'alt+l', label: '트리에 키보드 포커스', terminal: true },
      { key: 'alt+h', label: '프롬프트로 돌아가기', terminal: true },
      { key: '/filetree keys', label: 'alt+l과 alt+h 설정', terminal: true },
      { key: 'Esc', label: '프롬프트로 돌아가기', terminal: true },
    ],
  },
]

export const SCROLL_KEYS: ReadonlySet<string> = new Set(['up', 'down', 'j', 'k', 'pageup', 'pagedown', 'f', 'b', 'home', 'end'])

export function shortcutGroups(desktop: boolean): ShortcutGroup[] {
  return GROUPS.map(g => ({ title: g.title, keys: g.keys.filter(k => !desktop || !k.terminal) })).filter(g => g.keys.length > 0)
}

export function shortcutRows(accent: string, muted: string): RowSpec[] {
  const groups = shortcutGroups(false)
  const width = Math.max(...groups.flatMap(g => g.keys.map(k => k.key.length))) + 2
  const rows: RowSpec[] = [{ id: '', left: [{ t: ' 키보드 단축키', b: true, c: accent }], right: [{ t: '? 닫기 ', c: muted }] }]
  for (const g of groups) {
    rows.push({ id: '', left: [{ t: ' ' }], right: [] })
    rows.push({ id: '', left: [{ t: ` ${g.title}`, b: true }], right: [] })
    for (const k of g.keys) rows.push({ id: '', left: [{ t: `   ${k.key.padEnd(width)}`, c: accent }, { t: k.label }], right: [] })
  }
  return rows
}
