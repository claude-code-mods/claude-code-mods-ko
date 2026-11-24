import { atom, read, update } from 'claude-code'
import type { EngineInterface, InstructionFile, Register } from 'claude-code'

import type { MazyosArquivo, MazyosWorkspace } from '../types'
import { arquivoVigiado, lerTexto, lerWorkspace } from './memoria'
import { secaoSistema } from './sistema'

const PAINEL = 'mazyos'
const COMANDO = 'mazyos'
const SIM = '예, 실행해도 됩니다'
const NAO = '아니요, 취소'

// Troque a tag quando os campos de MazyosWorkspace mudarem: o valor que uma
// versão anterior guardou sobrevive ao reload e seria lido com a forma antiga.
const workspace = atom({ plugin: 'mazyos', key: 'workspace' } as const, null, {
  shape: 'workspace-1',
})

/** Comandos git que apagam histórico ou mudanças sem volta. */
const PERIGOSOS: readonly { regra: RegExp; nome: string }[] = [
  {
    regra: /\bgit\s+push\b(?:[^|;&\n]*\s)?(?:--force(?:-with-lease)?|-f)\b/,
    nome: 'git push --force',
  },
  { regra: /\bgit\s+reset\s+(?:[^|;&\n]*\s)?--hard\b/, nome: 'git reset --hard' },
  { regra: /\bgit\s+clean\b[^|;&\n]*\s-[a-zA-Z]*f/, nome: 'git clean -f' },
  { regra: /\bgit\s+checkout\s+--\s+\.(?:\s|$)/, nome: 'git checkout -- .' },
  { regra: /\bgit\s+restore\s+(?:[^|;&\n]*\s)?\.(?:\s|$)/, nome: 'git restore .' },
  { regra: /\bgit\s+branch\s+(?:[^|;&\n]*\s)?-D\b/, nome: 'git branch -D' },
]

const DIA = 24 * 60 * 60 * 1000

function haQuanto(agora: number, mtimeMs: number): string {
  const dias = Math.floor(Math.max(0, agora - mtimeMs) / DIA)
  if (dias === 0) return '오늘'
  if (dias === 1) return '어제'
  if (dias < 14) return `${dias}일 전`
  if (dias < 60) return `${Math.floor(dias / 7)}주 전`
  return `${Math.floor(dias / 30)}개월 전`
}

function estadoDoArquivo(arquivo: MazyosArquivo, agora: number): string {
  if (!arquivo.existe) return '없음'
  if (!arquivo.preenchido) return '비어 있음'
  return arquivo.mtimeMs > 0 ? `${haQuanto(agora, arquivo.mtimeMs)} 업데이트됨` : '작성됨'
}

function linhaDeStatus(ws: MazyosWorkspace): string {
  const partes = ['MazyOS', ws.nome ?? '이름 없는 사업']
  if (ws.foco !== null) partes.push(`집중: ${ws.foco}`)
  return partes.join(' · ')
}

function resumo(ws: MazyosWorkspace, painelColocado: boolean): string {
  if (!ws.instalado) {
    return `MazyOS: ${ws.raiz} 폴더에는 아직 워크스페이스가 없습니다. /mazyos:instalar를 실행해 여기에서 시스템을 시작하세요.`
  }
  const memoria = ws.arquivos
    .map(arquivo => `${arquivo.rotulo} ${arquivo.preenchido ? '●' : '○'}`)
    .join(' · ')
  return [
    linhaDeStatus(ws),
    `메모리: ${memoria}`,
    painelColocado
      ? '패널이 옆에 열렸습니다.'
      : '패널을 열었습니다. 터미널 너비가 충분하면 표시됩니다.',
  ].join('\n')
}

function mostrarStatus($: EngineInterface, ws: MazyosWorkspace | null, comLinha: boolean): void {
  $.ui.status(comLinha && ws !== null && ws.instalado ? linhaDeStatus(ws) : undefined)
}

/** Relê o workspace, guarda em `$.state` (o painel redesenha) e atualiza a linha de status. */
async function recarregar(
  $: EngineInterface,
  comLinha: boolean,
  raiz?: string,
): Promise<MazyosWorkspace> {
  const atual = await read($, workspace)
  const base = raiz ?? atual?.raiz ?? (await $.session.root())
  const novo = await lerWorkspace($, base)
  await update($, workspace, () => novo)
  mostrarStatus($, novo, comLinha)
  return novo
}

/** O workspace como está no estado, ou lido agora quando a sessão ainda não o leu. */
async function workspaceAtual($: EngineInterface): Promise<MazyosWorkspace> {
  return (await read($, workspace)) ?? (await lerWorkspace($, await $.session.root()))
}

/** As memórias preenchidas como arquivos de instrução, fora as que já estão na lista. */
async function arquivosDeMemoria(
  $: EngineInterface,
  ws: MazyosWorkspace,
  presentes: ReadonlySet<string>,
): Promise<InstructionFile[]> {
  const novos: InstructionFile[] = []
  for (const arquivo of ws.arquivos) {
    if (arquivo.chave === 'design' || !arquivo.preenchido || presentes.has(arquivo.caminho)) {
      continue
    }
    const content = await lerTexto($, arquivo.caminho)
    if (content.trim() !== '') novos.push({ path: arquivo.caminho, kind: 'project', content })
  }
  return novos
}

/** Depois de uma escrita que deu certo num arquivo vigiado: relê, avisa e pede o contexto de novo. */
async function aposEditar(
  $: EngineInterface,
  caminho: string,
  ran: { deny?: string; isError?: boolean },
  comLinha: boolean,
): Promise<void> {
  if (ran.deny !== undefined || ran.isError === true) return
  const ws = await read($, workspace)
  const raiz = ws?.raiz ?? (await $.session.root())
  const relativo = arquivoVigiado(raiz, caminho)
  if (relativo === undefined) return
  const novo = await recarregar($, comLinha, raiz)
  $.ui.invalidate('prompt.context')
  $.ui.toast(
    novo.instalado
      ? `MazyOS: ${relativo} 업데이트됨. 메모리를 다시 불러왔습니다.`
      : `MazyOS: ${relativo} 업데이트됨.`,
  )
}

export const register: Register = (on, options) => {
  const abrirPainel = options.abrirPainel !== false
  const comLinha = options.linhaDeStatus !== false
  const protegerGit = options.protegerGit !== false

  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: COMANDO,
      description: 'MazyOS 패널을 엽니다: 사업 메모리, 현재 집중, 스킬 단축키.',
    })
    const ws = await recarregar($, comLinha, e.cwd)

    if (ws.instalado) {
      if (abrirPainel && e.isInteractive) void $.ui.open({ id: PAINEL, title: 'MazyOS' })
    } else if (e.isInteractive) {
      // Um aviso por pasta, uma vez só: o plugin pode estar instalado no
      // escopo do usuário e aparecer em projetos que nada têm a ver com ele.
      const chave = `avisado:${ws.raiz}`
      if ((await $.store.get(chave)) === undefined) {
        await $.store.set(chave, true)
        $.ui.toast('MazyOS가 설치되었습니다. 이 폴더에서 시스템을 시작하려면 /mazyos:instalar를 실행하세요.')
      }
    }

    return next(e)
  })

  on('command.run', { command: COMANDO }, async $ => {
    const ws = await recarregar($, comLinha)
    const aberto = await $.ui.open({ id: PAINEL, title: 'MazyOS' })
    return { text: resumo(ws, aberto.isPlaced) }
  })

  // As regras de operação do MazyOS entram no fim do system prompt.
  on('prompt.compose', async ($, e, next) => {
    const composto = await next(e)
    if (e.traits.includes('bare')) return composto
    const ws = await workspaceAtual($)
    return {
      sections: [
        ...composto.sections,
        { id: 'mazyos:sistema', text: secaoSistema(ws, $.plugin.root), scope: 'session' },
      ],
    }
  })

  // A memória do negócio entra como arquivo de instrução, ao lado do CLAUDE.md:
  // o engine a reenvia quando o arquivo muda, como faz com o CLAUDE.md.
  on('prompt.context', async ($, e, next) => {
    const composto = await next(e)
    const ws = await workspaceAtual($)
    if (!ws.instalado || composto.instructionFiles === undefined) return composto
    const presentes = new Set(composto.instructionFiles.map(arquivo => arquivo.path))
    const novos = await arquivosDeMemoria($, ws, presentes)
    if (novos.length === 0) return composto
    return { ...composto, instructionFiles: [...composto.instructionFiles, ...novos] }
  })

  on('tool.call', { tool: 'Write' }, async ($, e, next) => {
    const ran = await next(e)
    await aposEditar($, e.file_path, ran, comLinha).catch(() => undefined)
    return ran
  })

  on('tool.call', { tool: 'Edit' }, async ($, e, next) => {
    const ran = await next(e)
    await aposEditar($, e.file_path, ran, comLinha).catch(() => undefined)
    return ran
  })

  // Guarda: um comando git que apaga trabalho só roda com o sim do usuário.
  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    if (!protegerGit) return next(e)
    const perigo = PERIGOSOS.find(candidato => candidato.regra.test(e.command))
    if (perigo === undefined) return next(e)
    const ws = await read($, workspace)
    if (ws === null || !ws.instalado) return next(e)

    const resposta = await $.ui.ask(
      `MazyOS가 "${perigo.nome}"을(를) 실행하려 합니다. 기록이나 변경 사항을 되돌릴 수 없게 삭제할 수 있습니다. 계속할까요?`,
      [SIM, NAO],
    )
    if (resposta !== SIM) {
      return {
        deny: `MazyOS: 사용자가 "${perigo.nome}"을(를) 취소했습니다. 상황을 설명하고 작업을 잃지 않는 방법을 제안하세요.`,
      }
    }
    return next(e)
  }).catch(($, e, next) =>
    next.called
      ? next(e)
      : {
          deny: 'MazyOS: 작업을 삭제하는 git 명령을 사용자에게 확인받지 못해 실행하지 않았습니다. 다시 시도하기 전에 명시적으로 확인을 받으세요.',
        },
  )

  on('ui.render', { component: 'Pane', requestId: PAINEL }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    const ws = await read($, workspace)
    const agora = await $.clock.now()
    const preencher = (texto: string) => () => $.prompt.fill({ text: texto, mode: 'replace' })

    if (ws === null || !ws.instalado) {
      return (
        <Box flexDirection="column" gap={1}>
          <Text weight="bold">MazyOS</Text>
          <Text dimColor wrap="wrap">
            이 폴더에는 아직 MazyOS 워크스페이스가 없습니다. /mazyos:instalar가 여기에 사업
            메모리, 브랜드 아이덴티티, 출력 폴더를 만들고 설정 인터뷰를 진행합니다.
          </Text>
          <Box gap={1} flexWrap="wrap">
            <Button
              key="instalar"
              label="여기에 설치"
              variant="primary"
              hotkey="i"
              onPress={preencher('/mazyos:instalar')}
            />
            <Button
              key="recarregar"
              label="다시 불러오기"
              hotkey="r"
              onPress={() => recarregar($, comLinha)}
            />
          </Box>
        </Box>
      )
    }

    const maiorRotulo = Math.max(...ws.arquivos.map(arquivo => arquivo.rotulo.length))

    return (
      <Box flexDirection="column" gap={1}>
        <Box flexDirection="column">
          <Text weight="bold">MazyOS · {ws.nome ?? '이름 없는 사업'}</Text>
          {ws.negocio !== null && (
            <Text dimColor wrap="wrap">
              {ws.negocio}
            </Text>
          )}
        </Box>

        <Box flexDirection="column">
          <Text wrap="wrap">
            <Text weight="semibold">집중: </Text>
            {ws.foco ?? '비어 있음'}
          </Text>
          <Text wrap="wrap">
            <Text weight="semibold">어조: </Text>
            {ws.tom ?? '비어 있음'}
          </Text>
        </Box>

        <Box flexDirection="column">
          <Text weight="semibold">메모리</Text>
          {ws.arquivos.map(arquivo => (
            <Text wrap="truncate-end">
              <Text color={arquivo.preenchido ? 'success' : 'warning'}>
                {arquivo.preenchido ? '●' : '○'}
              </Text>{' '}
              {arquivo.rotulo.padEnd(maiorRotulo)}{' '}
              <Text dimColor>{estadoDoArquivo(arquivo, agora)}</Text>
            </Text>
          ))}
        </Box>

        <Box gap={1} flexWrap="wrap">
          <Button key="abrir" label="세션 열기" hotkey="a" onPress={preencher('/mazyos:abrir')} />
          <Button
            key="atualizar"
            label="메모리 업데이트"
            hotkey="m"
            onPress={preencher('/mazyos:atualizar')}
          />
          <Button
            key="salvar"
            label="GitHub에 저장"
            hotkey="s"
            onPress={preencher('/mazyos:salvar')}
          />
          <Button key="recarregar" label="다시 불러오기" hotkey="r" onPress={() => recarregar($, comLinha)} />
        </Box>

        <Text dimColor>{haQuanto(agora, ws.lidoEm)} 읽음 · /mazyos로 이 패널을 다시 엽니다</Text>
      </Box>
    )
  })
}
