const asyncHandler=(fn)=>{
    return (req, res ,next)=>{
        promise.resolve(fn(req,res,next)).catch((err)=>next(err))
    }
}


export default asyncHandler;



//asyncHandler is a middleware function that takes an asynchronous function fn as an argument. It returns a new function that wraps the original function in a try-catch block, allowing any errors that occur during the execution of fn to be caught and passed to the next middleware in the Express.js request-response cycle. This helps to handle errors in asynchronous route handlers more effectively.