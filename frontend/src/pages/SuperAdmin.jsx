import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import useAuth from '../hooks/useAuth'
import { useToast } from '../components/Toast'
import styles from './SuperAdmin.module.css'

function SuperAdmin() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [instituicoes, setInstituicoes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [form, setForm] = useState({
    nome: '',
    email: '',
    cnpj: '',
    telefone: '',
    admin_nome: '',
    admin_email: '',
    admin_senha: '',
  })
  const [erro, setErro] = useState('')

  useEffect(() => {
    carregarInstituicoes()
  }, [])

  async function carregarInstituicoes() {
    try {
      setCarregando(true)
      const { data } = await api.get('/super-admin/instituicoes')
      setInstituicoes(data)
    } catch (error) {
      if (error.response?.status === 403) {
        navigate('/dashboard')
      }
    } finally {
      setCarregando(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setSalvando(true)
    try {
      await api.post('/super-admin/instituicoes', form)
      addToast('Escola criada com sucesso!', 'sucesso')
      setModalAberto(false)
      setForm({ nome: '', email: '', cnpj: '', telefone: '', admin_nome: '', admin_email: '', admin_senha: '' })
      carregarInstituicoes()
    } catch (error) {
      setErro(error.response?.data?.erro || 'Erro ao criar escola')
    } finally {
      setSalvando(false)
    }
  }

  async function toggleAtivo(inst) {
    try {
      await api.patch(`/super-admin/instituicoes/${inst.id}/toggle`)
      addToast(inst.ativo ? 'Escola desativada' : 'Escola reativada', inst.ativo ? 'aviso' : 'sucesso')
      carregarInstituicoes()
    } catch (error) {
      addToast('Erro ao atualizar', 'erro')
    }
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const labelStyle = {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    display: 'block',
    marginBottom: '5px'
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLogo}>
          <div className={styles.logoIcon}>SA</div>
          <div>
            <span className={styles.logoTitle}>Super Admin</span>
            <span className={styles.logoSub}>Gestão de escolas</span>
          </div>
        </div>
        <div className={styles.headerUser}>
          <span className={styles.userName}>{usuario?.nome}</span>
          <button className={styles.btnLogout} onClick={handleLogout}>Sair</button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.topBar}>
          <div>
            <h1 className={styles.titulo}>Escolas cadastradas</h1>
            <p className={styles.subtitulo}>{instituicoes.length} escola(s)</p>
          </div>
          <button className={styles.btnNova} onClick={() => setModalAberto(true)}>
            + Nova Escola
          </button>
        </div>

        {carregando ? (
          <div className={styles.vazio}>Carregando...</div>
        ) : instituicoes.length === 0 ? (
          <div className={styles.vazio}>Nenhuma escola cadastrada.</div>
        ) : (
          <div className={styles.grid}>
            {instituicoes.map(inst => (
              <div key={inst.id} className={`${styles.card} ${!inst.ativo ? styles.cardInativo : ''}`}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardNome}>{inst.nome}</h3>
                  <span className={`${styles.badge} ${inst.ativo ? styles.badgeAtivo : styles.badgeInativo}`}>
                    {inst.ativo ? 'Ativa' : 'Inativa'}
                  </span>
                </div>

                <div className={styles.cardInfo}>
                  {inst.email && <p>📧 {inst.email}</p>}
                  {inst.telefone && <p>📞 {inst.telefone}</p>}
                  {inst.cnpj && <p>🏢 {inst.cnpj}</p>}
                </div>

                <div className={styles.cardStats}>
                  <div className={styles.stat}>
                    <span className={styles.statNum}>{inst.total_usuarios}</span>
                    <span className={styles.statLabel}>Usuários</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statNum}>{inst.total_produtos}</span>
                    <span className={styles.statLabel}>Produtos</span>
                  </div>
                </div>

                <div className={styles.cardAcoes}>
                  <button
                    onClick={() => toggleAtivo(inst)}
                    className={inst.ativo ? styles.btnDesativar : styles.btnAtivar}
                  >
                    {inst.ativo ? 'Desativar' : 'Reativar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {modalAberto && (
        <div className={styles.overlay} onClick={() => setModalAberto(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Nova Escola</h2>
              <button className={styles.btnFechar} onClick={() => setModalAberto(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className={styles.modalForm}>
              {erro && <div className={styles.erro}>{erro}</div>}

              <p style={{ fontSize: '12px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Dados da escola</p>

              <div className={styles.campo}>
                <label style={labelStyle}>Nome da escola *</label>
                <input name="nome" value={form.nome} onChange={handleChange} placeholder="Ex: Colégio Teutônia" className={styles.input} />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div className={styles.campo} style={{ flex: 1 }}>
                  <label style={labelStyle}>E-mail</label>
                  <input name="email" value={form.email} onChange={handleChange} placeholder="contato@escola.com" className={styles.input} />
                </div>
                <div className={styles.campo} style={{ flex: 1 }}>
                  <label style={labelStyle}>Telefone</label>
                  <input name="telefone" value={form.telefone} onChange={handleChange} placeholder="(51) 99999-9999" className={styles.input} />
                </div>
              </div>

              <div className={styles.campo}>
                <label style={labelStyle}>CNPJ</label>
                <input name="cnpj" value={form.cnpj} onChange={handleChange} placeholder="00.000.000/0001-00" className={styles.input} />
              </div>

              <p style={{ fontSize: '12px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '8px' }}>Administrador da escola</p>

              <div className={styles.campo}>
                <label style={labelStyle}>Nome do administrador *</label>
                <input name="admin_nome" value={form.admin_nome} onChange={handleChange} placeholder="Nome completo" className={styles.input} />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div className={styles.campo} style={{ flex: 1 }}>
                  <label style={labelStyle}>E-mail do admin *</label>
                  <input name="admin_email" value={form.admin_email} onChange={handleChange} placeholder="admin@escola.com" className={styles.input} />
                </div>
                <div className={styles.campo} style={{ flex: 1 }}>
                  <label style={labelStyle}>Senha *</label>
                  <input type="password" name="admin_senha" value={form.admin_senha} onChange={handleChange} placeholder="Mínimo 6 caracteres" className={styles.input} />
                </div>
              </div>

              <div className={styles.modalAcoes}>
                <button type="button" onClick={() => setModalAberto(false)} className={styles.btnCancelar}>Cancelar</button>
                <button type="submit" disabled={salvando} className={styles.btnSalvar}>
                  {salvando ? 'Criando...' : 'Criar escola'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default SuperAdmin