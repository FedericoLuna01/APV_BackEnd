import Veterinario from "../models/Veterinario.js";
import generarJWT from "../helpers/generarJWT.js";
import generarId from "../helpers/generarId.js";
import emailRegistro from "../helpers/emailRegistro.js";
import emailOlvidePassword from "../helpers/emailOlvidePassword.js";


const registrar = async (req, res) => {
    const {email, nombre} = req.body;

    // revisar si un usuario esta duplicado
    const existeUsuario = await Veterinario.findOne({
        email
    })

    if (existeUsuario) {
        const error = new Error("El usuario ya está registrado");
        return res.status(400).json({msg: error.message});
    }

    try {
        // guardar un nuevo veterinario
        const veterinario = new Veterinario(req.body);
        const veterinarioGuardado = await veterinario.save();

        // enviar email
        emailRegistro({email, nombre, token: veterinarioGuardado.token})

        res.json(veterinarioGuardado);
    } catch (error) {
        console.log(error);

    };
};

const perfil = (req, res) => {
    const {veterinario} = req

    res.json(veterinario);
};

const confirmar = async (req, res) => {
    const {token} = req.params;

    const usuarioConfirmar = await Veterinario.findOne({
        token
    });

    if (!usuarioConfirmar) {
        const error = new Error("Token no válido");
        return res.status(404).json({msg: error.message})
    }

    try {
        usuarioConfirmar.token = null;
        usuarioConfirmar.confirmado = true;
        await usuarioConfirmar.save();

        res.json({msg: "Usuario confirmado correctamente"});
    } catch (error) {
        console.log(error)
    }

};

const autenticar = async (req, res) => {
    const {email, password} = req.body;

    // comprobar si el usuraio existe
    const usuario = await Veterinario.findOne({email});

    if (!usuario) {
        const error = new Error("El usuario no existe");
        return res.status(404).json({msg: error.message})
    }

    // comprobar si esta confirmado
    if(!usuario.confirmado) {
        const error = new Error("El usuario no está confirmado");
        return res.status(403).json({msg: error.message})
    }

    // revisar password
    if(await usuario.comprobarPassword(password)) {
        // autenticar
        res.json({
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            token: generarJWT(usuario.id),
            confirmado: usuario.confirmado
        })
    } else {
        const error = new Error("El password es incorrecto");
        return res.status(403).json({msg: error.message})
    }
    
}

const olvidePassword = async (req, res) => {
    const {email} = req.body;

    const existeVeterinario = await Veterinario.findOne({email});
    if(!existeVeterinario) {
        const error = new Error("El usuario no existe");
        return res.status(400).json({msg: error.message})
    };

    try {
        existeVeterinario.token = generarId();
        await existeVeterinario.save();

        // enviar email
        emailOlvidePassword({
            email,
            nombre: existeVeterinario.nombre,
            token: existeVeterinario.token
        })

        res.json({msg: "Se ha enviado un link para restablecer su password. Revise su Email."})
    } catch (error) {
        console.log(error)
    }
}

const comprobarToken = async (req, res) => {
    const {token} = req.params;
    const tokenValido = await Veterinario.findOne({token});
    if(tokenValido) {
        res.json({msg: "Token válido"});
    } else {
        const error = new Error("Token no válido");
        return res.status(400).json({msg: error.message})
    }
}

const nuevoPassword = async (req, res) => {
    const {token} = req.params;
    const {password} = req.body;

    const veterinario = await Veterinario.findOne({token});
    if(!veterinario) {
        const error = new Error("Token no válido");
        return res.status(400).json({msg: error.message})
    } 

    try {
        veterinario.token = null;
        veterinario.password = password;
        await veterinario.save();
        res.json({msg: "Password actualizado correctamente"})
    } catch (error) {
        console.log(error)
    }
    
}

const actualizarPerfil = async (req, res) => {
    const veterinario = await Veterinario.findById(req.params.id)
    if(!veterinario) {
        const error = new Error('Hubo un error')
        return res.status(400).json({msg: error.message})
    }

    const {email} = req.body
    if(veterinario.email !== req.body.email) {
        const exsiteEmail = await Veterinario.findOne({email})
        if(exsiteEmail) {
            const error = new Error('Ya hay una cuenta registrada con este Email')
            return res.status(400).json({msg: error.message})
        }
    }

    try {
        veterinario.nombre = req.body.nombre;
        veterinario.email = req.body.email;
        veterinario.telefono = req.body.telefono;
        veterinario.web = req.body.web;

        const veterinarioActualizado = await veterinario.save()
        res.json(veterinarioActualizado)
    } catch (error) {
        console.log(error)
    }
}

const actualizarPassword = async (req, res) => {
    const {id} = req.veterinario;
    const {passActual, passNueva} = req.body;
    
    const veterinario = await Veterinario.findById(id)
    if(!veterinario) {
        const error = new Error('Hubo un error')
        return res.status(400).json({msg: error.message})
    }

    if(await veterinario.comprobarPassword(passActual)) {
        veterinario.password = passNueva;
        await veterinario.save()
        res.json({
            msg: 'Contraseña actualizada correctamente'
        })
    } else {
        const error = new Error('La contraseña actual es incorrecta')
        return res.status(400).json({msg: error.message})
    }
}

export {
    registrar,
    perfil,
    confirmar,
    autenticar,
    olvidePassword,
    comprobarToken,
    nuevoPassword,
    actualizarPerfil,
    actualizarPassword
}