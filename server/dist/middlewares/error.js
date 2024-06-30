// error middleware
// defined a basic error layout
// we can pass an error, but if there is any unknown error - it is handled with an internal server error
export const errorMiddleware = (err, req, res, next) => {
    err.message || (err.message = "Internal Server Error");
    err.statusCode || (err.statusCode = 500);
    return res.status(err.statusCode).json({
        success: false,
        message: err.message,
    });
};
// error handler - wrapper
// made so that we don't have to write the try-catch block in controllers whenever we make a new controller
export const TryCatch = (func) => (req, res, next) => {
    return Promise.resolve(func(req, res, next)).catch(next);
};
