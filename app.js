const express = require('express')
const app = express()
const mongoose = require('mongoose')
const LocalStorage = require('node-localstorage').LocalStorage
const localstorage = new LocalStorage('./scratch')
const port = 3000


mongoose.connect('mongodb+srv://einsteindev:1234@cluster0.i179z.mongodb.net/SistemaParaBiblioteca?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})


// CRIANDO UM MODELO  PARA INCLUSÃO DE LIVROS NO BANCO DE DADOS
const livros = mongoose.model('Cadastro de Livros', {
    titulo: String,
    nomeAutor: String,
    anoPublicacao: String,
})

// CRIANDO UM MODELO PARA CADASTRAR OS USUARIOS NO BANCO DE DADOS
const cadastro = mongoose.model('cadastro', {
    nome: String,
    sobrenome: String,
    email: String,
    senha: String,
    acesso: String
})

const alunos = mongoose.model('alunos', {
    nome: String,
    matricula: String,
    curso: String,
})

const usuarios = mongoose.model('usuarios', {
    nome: String,
    sobrenome: String,
    email: String,
    senha: String,
    acesso: String,
    alugados: Object,
    matricula: String,
    entrega: String
})



// CRIANDO UM MODELO  PARA INCLUSÃO DE ALUNOS NO BANCO DE DADOS
// const alunos = mongoose.model('Cadastro de Alunos', {
//   nome: String,
//   email: String,
//   senha: String,
// })


app.set('views', __dirname + '/views')
app.set('view engine', 'ejs')

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(express.static(__dirname + '/public'))

// *************************************************************
// ************************** ROTAS ****************************

// ************** INICIAL***********
app.get('/', (req, res) => {
    if (localstorage.getItem('aluno') != null) {
        res.redirect('/aluno')
    } else if (localstorage.getItem('admin') != null) {
        res.redirect('/admin')
    } else {
        res.render('paginaInicial')
    }
})
// ************** LOGIN ***********
app.get('/login', (req, res) => {
    res.render('sing_in')
    this.emprestimo = 0
})
// ************** CADASTROL***********
app.get('/cadastro', (req, res) => {
    res.render('cadastro')
    this.emprestimo = 0
})
// ************** CADASTRANDO***********
app.post('/cadastrando', (req, res) => {
    let _cadastro = new cadastro()
    _cadastro.nome = req.body.nome
    _cadastro.sobrenome = req.body.sobrenome
    _cadastro.email = req.body.email
    _cadastro.senha = req.body.senha
    _cadastro.acesso = 'aluno'

    _cadastro.save((erro, result) => {
        if (erro) throw erro
        res.redirect('/login')
    })
})

// ************** CHECKLOGIN***********
app.post('/checklogin', (req, res) => {
    let usuario = req.body.usuario
    let senha = req.body.senha

    cadastro.findOne({ nome: usuario }, (err, result) => {
        let infUsuario = result
        console.log(infUsuario)
        if (err) throw err

        if (result == null) {
            res.redirect('/login')
        } else if (result.nome == usuario && result.senha == senha && result.acesso == 'aluno') {
            localstorage.setItem('aluno', usuario)
            localstorage.setItem('usuario', JSON.stringify(infUsuario))
            console.log(localstorage.getItem('usuario'))
            res.redirect('/aluno')
        } else if (result.nome == usuario && result.senha == senha && result.acesso == 'admin') {
            localstorage.setItem('admin', usuario)
            res.redirect('/admin')
        } else {
            res.redirect('/login')
        }

    })
    //     if(err) throw err
    //     res.send(result)
    //     console.log(result)

    // console.log(usuario)


})
// ************** ALUNO ***********
app.get('/aluno', (req, res) => {
    if (localstorage.getItem('aluno') != null) {
        res.render('paginaAluno')
        this.emprestimo = 0
    } else {
        res.redirect('/login')
    }
})
// ************** ADMIN ***********
app.get('/admin', (req, res) => {
    livros.find({}, (err, result) => {
        if (localstorage.getItem('admin') != null) {
            res.render('painel', { livros: result })
            this.emprestimo = 0
        } else {
            res.redirect('/login')
        }

    })
})
// ************** LOGOUT ***********
app.get('/logout', (req, res) => {
    localstorage.removeItem('admin')
    localstorage.removeItem('aluno')
    localstorage.removeItem('usuario')
    res.redirect('/')
})
// ************** PAINEL***********
app.get('/painel', (req, res) => {
    if (localstorage.getItem('admin') != null) {
        livros.find({}, (err, result) => {
            if (err) throw err
            res.render('cadastrolivros', { livro: result })
        })
        this.emprestimo = 0
    } else {
        res.send('<h1>Você não tem permissão de acesso ainda</h1>')
    }

})
// ************** CADASTRANDOLIVROS***********
app.post('/cadastrandolivros', (req, res) => {
    if (localstorage.getItem('admin') != null) {
        let _livros = new livros()
        _livros.titulo = req.body.titulo
        _livros.nomeAutor = req.body.autor
        _livros.anoPublicacao = req.body.ano

        _livros.save((erro, resultado) => {
            if (erro) throw erro
            this.livro = resultado
            res.redirect('/painel')
        })
    } else {
        res.redirect('/login')
    }
})
// ************** EXCLUIR EMPRESTIMO ***********
app.get('/excluir/:id', (req, res) => {
    if (localstorage.getItem('admin') != null) {
        livros.deleteOne({ _id: req.params.id }, (erro, resultado) => {
            res.redirect('/painel')
        })
        this.emprestimo = 0
    } else {
        res.redirect('/login')
    }
})
// ************** EDITAR EMPRESTIMO***********
app.get('/editar/:id', (req, res) => {
    if (localstorage.getItem('admin') != null) {
        livros.findOne({ _id: req.params.id }, (erro, resultado) => {
            if (erro) throw erro
            this.editar = resultado
            res.redirect('/painelEditar')
        })
        this.emprestimo = 0
    } else {
        res.redirect('/login')
    }
})
// ************** PAINELEDITAR EMPRESTIMOS***********
app.get('/painelEditar', (req, res) => {
    if (localstorage.getItem('admin') != null) {
        livros.find({}, (err, result) => {
            if (err) throw err
            res.render('editar', { editar: this.editar, livro: result })
        })
        this.emprestimo = 0
    } else {
        res.redirect('/login')
    }
})
// ************** EDITANDO LIVROS***********
app.post('/editando', (req, res) => {
    livros.findById(this.editar._id, (err, result) => {
        if (err) throw err
        let atualizacao = {
            titulo: req.body.titulo,
            nomeAutor: req.body.autor,
            anoPublicacao: req.body.ano
        }

        livros.updateOne(result, atualizacao, (err, result) => {
            if (err) throw err
            res.redirect('/painel')
        })


    })
})
// ************** PAINELALUNO ***********
app.get('/painelAluno', (req, res) => {
    if (localstorage.getItem('admin') != null) {
        alunos.find({}, (err, result) => {
            if (err) throw err
            res.render('cadastroalunos', { editar: this.editar, aluno: result })
            this.resultAluno = result
            this.emprestimo = 0
            console.log(this.resultAluno)
        })
    } else {
        res.redirect('/login')
    }
})
// ************** CADASTRARALUNOS ***********
app.post('/cadastraralunos', (req, res) => {
    let nossosAlunos = new alunos()
    nossosAlunos.nome = req.body.aluno
    nossosAlunos.matricula = req.body.matricula
    nossosAlunos.curso = req.body.curso
    nossosAlunos.acesso = 'aluno'

    nossosAlunos.save((erro, result) => {
        if (erro) throw erro
        res.redirect('/painelAluno')
    })
})
// ************** EXCLUIRALUNOS ***********
app.get('/excluirAlunos/:id', (req, res) => {
    if (localstorage.getItem('admin') != null) {
        alunos.deleteOne({ _id: req.params.id }, (erro, resultado) => {
            res.redirect('/painelAluno')
        })
        this.emprestimo = 0
    } else {
        res.redirect('/login')
    }
})


// ************** EDITARALUNOS ***********
app.get('/editarAlunos/:id', (req, res) => {
    if (localstorage.getItem('admin') != null) {
        alunos.findById(req.params.id, (erro, resultado) => {
            if (erro) throw erro
            this.editarAluno = resultado
            res.redirect('/painelEditarAluno')
            this.emprestimo = 0
        })
    } else {
        res.redirect('/login')
    }
})
// ************** PAINELEDITARALUNO ***********
app.get('/painelEditarAluno', (req, res) => {
    if (localstorage.getItem('admin') != null) {
        alunos.find({}, (err, result) => {
            if (err) throw err
            res.render('editarAluno', { editar: this.editarAluno, aluno: result })
        })
        this.emprestimo = 0
    } else {
        res.redirect('/login')
    }
})
// ************** EDITANDOALUNO ***********
app.post('/editandoAluno', (req, res) => {
    alunos.findById(this.editarAluno._id, (err, result) => {
        if (err) throw err
        let atualizacao = {
            nome: req.body.aluno,
            matricula: req.body.matricula,
            curso: req.body.curso
        }

        alunos.updateOne(result, atualizacao, (err, result) => {
            if (err) throw err
            res.redirect('/painelAluno')
        })


    })
})
// ************** EMPRESTIMOS ***********
app.get('/emprestimos', (req, res) => {
    usuarios.find({ nome: localstorage.getItem('aluno') }, (err, result) => {
        if (localstorage.getItem('aluno') != null) {
            res.render('emprestimos', { livro: this.emprestimo, alugados: result })
            console.log(result)
        } else {
            res.send("Você não está com um login de aluno.")
        }
    })

})
// ************** RESERVANDO ***********
app.post('/reservando', (req, res) => {
    let infUsuarioJson = localstorage.getItem('usuario')
    console.log(infUsuarioJson)
    let infOBJ = JSON.parse(infUsuarioJson)
    console.log(infOBJ)

    alunos.findOne({ nome: localstorage.getItem('aluno') }, (err, result) => {
        if (result != null) {
            let _usuario = new usuarios()
            _usuario.nome = infOBJ.nome
            _usuario.sobrenome = infOBJ.sobrenome
            _usuario.email = infOBJ.email
            _usuario.alugados = {
                titulo: req.body.titulolivro,
                autor: req.body.autor,
                anoPublicacao: req.body.ano
            }
            _usuario.matricula = result.matricula
            _usuario.entrega = '10/01/2022'

            this.matricula = result.matricula

            _usuario.save((erro, resultado) => {
                if (erro) throw erro
                this.emprestimo = ''
                res.redirect('/emprestimos')
            })
        } else {
            res.send('<h1>Parabéns, este livro está reservado para você.</h1>'+
            '<p>Data para retirada: 2 Dias úteis</p>'+
            '<p>Data para Devolução ou Renovação: 14 dias após a retirada.</p>'+
            '<p>Limite de renovação: 2 (caso ncessite de mais renovações comunique o administrador</p>')
        }
    })





})
// ************** LIVROS ***********
app.get('/livros', (req, res) => {

    livros.find({}, (err, result) => {
        if (localstorage.getItem('aluno') != null) {
            res.render('livros', { livros: result })
            this.emprestimo = 0

        } else {
            res.render('exibeLivros', { livros: result })
        }

    })

})
// ************** ALUGAR ***********
app.get('/alugar/:id', (req, res) => {
    if (localstorage.getItem('aluno') != null) {
        livros.findById(req.params.id, (err, result) => {
            this.emprestimo = result
            res.redirect('/emprestimos')
        })
    } else {
        res.send('<h1>Você não esta logado como aluno</h1>')
    }
})
// ************** ENTREGAR ***********
app.get('/entregar/:id', (req, res) => {
    usuarios.deleteOne({ _id: req.params.id }, (err, result) => {
        if (err) throw err
        res.redirect('/emprestimos')
    })
})

app.listen(port, () => {
    console.log('Biblioteca no ar, na porta: ' + port)
})
