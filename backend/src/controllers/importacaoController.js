const { parse } = require('csv-parse/sync')
const db = require('../config/database')

const COLUNAS_OBRIGATORIAS = ['codigo_interno', 'nome', 'tipo']
const TIPOS_VALIDOS = ['consumivel', 'reutilizavel']

async function importarProdutos(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ erro: 'Nenhum arquivo enviado' })
    }

    const conteudo = req.file.buffer.toString('utf-8')
    let registros

    try {
      registros = parse(conteudo, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      })
    } catch {
      return res.status(400).json({ erro: 'Arquivo CSV inválido ou mal formatado' })
    }

    if (registros.length === 0) {
      return res.status(400).json({ erro: 'Arquivo CSV está vazio' })
    }

    const colunas = Object.keys(registros[0]).map(c => c.toLowerCase())
    const faltando = COLUNAS_OBRIGATORIAS.filter(c => !colunas.includes(c))

    if (faltando.length > 0) {
      return res.status(400).json({
        erro: `Colunas obrigatórias ausentes: ${faltando.join(', ')}`
      })
    }

    const erros = []
    const validos = []

    for (let i = 0; i < registros.length; i++) {
      const linha = i + 2
      const r = registros[i]

      if (!r.codigo_interno) {
        erros.push({ linha, erro: 'codigo_interno é obrigatório' })
        continue
      }

      if (!r.nome) {
        erros.push({ linha, erro: 'nome é obrigatório' })
        continue
      }

      if (!TIPOS_VALIDOS.includes(r.tipo)) {
        erros.push({ linha, erro: `tipo inválido: "${r.tipo}". Use: consumivel ou reutilizavel` })
        continue
      }

      const existe = await db('produtos')
        .where({ codigo_interno: r.codigo_interno, instituicao_id: req.instituicaoId })
        .first()

      if (existe) {
        erros.push({ linha, erro: `código "${r.codigo_interno}" já cadastrado` })
        continue
      }

      validos.push({
        instituicao_id: req.instituicaoId,
        codigo_interno: r.codigo_interno,
        nome: r.nome,
        descricao: r.descricao || null,
        tipo: r.tipo,
        unidade_medida: r.unidade_medida || 'un',
        quantidade_atual: parseInt(r.quantidade_atual) || 0,
        quantidade_minima: parseInt(r.quantidade_minima) || 0,
        localizacao_fisica: r.localizacao_fisica || null,
        observacoes: r.observacoes || null,
        status: 'disponivel',
      })
    }

    if (validos.length > 0) {
      await db('produtos').insert(validos)
    }

    return res.json({
      importados: validos.length,
      erros: erros.length,
      detalhes_erros: erros,
      mensagem: `${validos.length} produto(s) importado(s) com sucesso.`
    })
  } catch (error) {
    next(error)
  }
}

const COLUNAS_OBRIGATORIAS_PESSOAS = ['nome_completo']

async function importarPessoas(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ erro: 'Nenhum arquivo enviado' })
    }

    const conteudo = req.file.buffer.toString('utf-8')
    let registros

    try {
      registros = parse(conteudo, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      })
    } catch {
      return res.status(400).json({ erro: 'Arquivo CSV inválido ou mal formatado' })
    }

    if (registros.length === 0) {
      return res.status(400).json({ erro: 'Arquivo CSV está vazio' })
    }

    const colunas = Object.keys(registros[0]).map(c => c.toLowerCase())
    const faltando = COLUNAS_OBRIGATORIAS_PESSOAS.filter(c => !colunas.includes(c))

    if (faltando.length > 0) {
      return res.status(400).json({
        erro: `Colunas obrigatórias ausentes: ${faltando.join(', ')}`
      })
    }

    const erros = []
    const validos = []

    for (let i = 0; i < registros.length; i++) {
      const linha = i + 2
      const r = registros[i]

      if (!r.nome_completo) {
        erros.push({ linha, erro: 'nome_completo é obrigatório' })
        continue
      }

      if (r.matricula) {
        const existe = await db('pessoas')
          .where({ matricula: r.matricula, instituicao_id: req.instituicaoId })
          .first()

        if (existe) {
          erros.push({ linha, erro: `matrícula "${r.matricula}" já cadastrada` })
          continue
        }
      }

      validos.push({
        instituicao_id: req.instituicaoId,
        nome_completo: r.nome_completo,
        matricula: r.matricula || null,
        email: r.email || null,
        setor: r.setor || null,
        cargo: r.cargo || null,
        telefone: r.telefone || null,
        ativo: true,
      })
    }

    if (validos.length > 0) {
      await db('pessoas').insert(validos)
    }

    return res.json({
      importados: validos.length,
      erros: erros.length,
      detalhes_erros: erros,
      mensagem: `${validos.length} pessoa(s) importada(s) com sucesso.`
    })
  } catch (error) {
    next(error)
  }
}

module.exports = { importarProdutos, importarPessoas }  