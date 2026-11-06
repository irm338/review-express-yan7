// Middleware genérico para validar datos usando clases DTO
const validarDto = (DtoClase) => {
    return (req, res, next) => {
        const dto = new DtoClase(req.body);
        const error = dto.validar ? dto.validar() : null;

        if (error) {
            return res.status(400).json({
                exito: false,
                mensaje: error
            });
        }

        next();
    };
};

module.exports = validarDto;