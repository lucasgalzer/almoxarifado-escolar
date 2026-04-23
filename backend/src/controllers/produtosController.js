const db = require('../config/database')
const { registrar } = require('../utils/auditLog')

async function listar(req, res, next) {
  try {
    const { categoria_id, status, tipo, busca, pagina = 1, por_pagina = 20 } = req.query

    let queryBase = db('produtos as p')
      .leftJoin('categorias as c', 'p.categoria_id', 'c.id')
      .where('p.instituicao_id', req.instituicaoId)

    if (categoria_id) queryBase = queryBase.where('p.categoria_id', categoria_id)
    if (status) queryBase = queryBase.where('p.status', status)
    if (tipo) queryBase = queryBase.where('p.tipo', tipo)
    if (busca) queryBase = queryBase.whereILike('p.nome', `%${busca}%`)

    // Se pedir todos retorna sem paginação
    if (por_pagina === 'todos') {
      const produtos = await queryBase.clone().select('p.*', 'c.nome as categoria_nome').orderBy('p.nome')
      return res.json({ dados: produtos, total: produtos.length, pagina: 1, total_paginas: 1 })
    }

    // Conta total separado
    const [{ total }] = await queryBase.clone().count('p.id as total')

    const offset = (parseInt(pagina) - 1) * parseInt(por_pagina)
    const produtos = await queryBase.clone()
      .select('p.*', 'c.nome as categoria_nome')
      .orderBy('p.nome')
      .limit(parseInt(por_pagina))
      .offset(offset)

    return res.json({
      dados: produtos,
      total: parseInt(total),
      pagina: parseInt(pagina),
      por_pagina: parseInt(por_pagina),
      total_paginas: Math.ceil(parseInt(total) / parseInt(por_pagina))
    })
  } catch (error) {
    next(error)
  }
}

async function buscarPorId(req, res, next) {
  try {
    const produto = await db('produtos as p')
      .leftJoin('categorias as c', 'p.categoria_id', 'c.id')
      .where('p.id', req.params.id)
      .where('p.instituicao_id', req.instituicaoId)
      .select('p.*', 'c.nome as categoria_nome')
      .first()

    if (!produto) {
      return res.status(404).json({ erro: 'Produto não encontrado' })
    }

    return res.json(produto)
  } catch (error) {
    next(error)
  }
}

async function criar(req, res, next) {
  try {
    const {
      codigo_interno, nome, descricao, categoria_id,
      unidade_medida, tipo, quantidade_atual,
      quantidade_minima, localizacao_fisica, observacoes,
      campos_extras, status
    } = req.body

    if (!nome) return res.status(400).json({ erro: 'Nome é obrigatório' })
    if (!tipo) return res.status(400).json({ erro: 'Tipo é obrigatório' })
    if (!codigo_interno) return res.status(400).json({ erro: 'Código interno é obrigatório' })

    const codigoExiste = await db('produtos')
      .where({ codigo_interno, instituicao_id: req.instituicaoId })
      .first()

    if (codigoExiste) {
      return res.status(409).json({ erro: 'Código interno já cadastrado' })
    }

    // Busca tipo de controle da categoria
    let tipoControle = 'quantidade'
    if (categoria_id) {
      const categoria = await db('categorias').where({ id: categoria_id }).first()
      tipoControle = categoria?.tipo_controle || 'quantidade'

      const camposObrigatorios = await db('campos_categoria')
        .where({ categoria_id, obrigatorio: true })

      for (const campo of camposObrigatorios) {
        const valor = campos_extras?.[campo.nome]
        if (!valor && valor !== 0 && valor !== false) {
          return res.status(400).json({ erro: `Campo "${campo.label}" é obrigatório` })
        }
      }
    }

    const [produto] = await db('produtos').insert({
      instituicao_id: req.instituicaoId,
      codigo_interno,
      nome,
      descricao,
      categoria_id: categoria_id || null,
      unidade_medida: unidade_medida || 'un',
      tipo,
      quantidade_atual: tipoControle === 'individual' ? 1 : (quantidade_atual || 0),
      quantidade_minima: tipoControle === 'individual' ? 0 : (quantidade_minima || 0),
      localizacao_fisica,
      observacoes,
      campos_extras: campos_extras ? JSON.stringify(campos_extras) : null,
      status: status || 'disponivel'
    }).returning('*')

    await registrar(null, {
      usuario_id: req.usuarioId,
      instituicao_id: req.instituicaoId,
      acao: 'PRODUTO_CRIADO',
      tabela: 'produtos',
      registro_id: produto.id,
      dados_depois: produto,
    })

    return res.status(201).json(produto)
  } catch (error) {
    next(error)
  }
}

async function atualizar(req, res, next) {
  try {
    const {
      codigo_interno, nome, descricao, categoria_id,
      unidade_medida, tipo, quantidade_minima,
      localizacao_fisica, status, observacoes,
      campos_extras
    } = req.body

    if (!nome) return res.status(400).json({ erro: 'Nome é obrigatório' })
    if (!tipo) return res.status(400).json({ erro: 'Tipo é obrigatório' })

    // Busca tipo de controle da categoria
    let tipoControle = 'quantidade'
    if (categoria_id) {
      const categoria = await db('categorias').where({ id: categoria_id }).first()
      tipoControle = categoria?.tipo_controle || 'quantidade'

      const camposObrigatorios = await db('campos_categoria')
        .where({ categoria_id, obrigatorio: true })

      for (const campo of camposObrigatorios) {
        const valor = campos_extras?.[campo.nome]
        if (!valor && valor !== 0 && valor !== false) {
          return res.status(400).json({ erro: `Campo "${campo.label}" é obrigatório` })
        }
      }
    }

    const [produto] = await db('produtos')
      .where({ id: req.params.id, instituicao_id: req.instituicaoId })
      .update({
        codigo_interno,
        nome,
        descricao,
        categoria_id: categoria_id || null,
        unidade_medida,
        tipo,
        quantidade_minima: tipoControle === 'individual' ? 0 : (quantidade_minima || 0),
        localizacao_fisica,
        status,
        observacoes,
        campos_extras: campos_extras ? JSON.stringify(campos_extras) : null,
        updated_at: new Date()
      }).returning('*')

    if (!produto) {
      return res.status(404).json({ erro: 'Produto não encontrado' })
    }

    await registrar(null, {
      usuario_id: req.usuarioId,
      instituicao_id: req.instituicaoId,
      acao: 'PRODUTO_ATUALIZADO',
      tabela: 'produtos',
      registro_id: produto.id,
      dados_depois: produto,
    })

    return res.json(produto)
  } catch (error) {
    next(error)
  }
}

async function excluir(req, res, next) {
  try {
    const produto = await db('produtos')
      .where({ id: req.params.id, instituicao_id: req.instituicaoId })
      .first()

    if (!produto) {
      return res.status(404).json({ erro: 'Produto não encontrado' })
    }

    const emUso = await db('emprestimos')
      .where({ produto_id: req.params.id, status: 'emprestado' })
      .first()

    if (emUso) {
      return res.status(400).json({ erro: 'Produto possui empréstimo ativo' })
    }

    await db('produtos').where({ id: req.params.id }).delete()

    await registrar(null, {
      usuario_id: req.usuarioId,
      instituicao_id: req.instituicaoId,
      acao: 'PRODUTO_EXCLUIDO',
      tabela: 'produtos',
      registro_id: req.params.id,
      dados_antes: produto,
    })

    return res.status(204).send()
  } catch (error) {
    next(error)
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir }