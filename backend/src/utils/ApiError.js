class ApiError extends Error{
    constructor(
      statusCode,
      message= 'something wrong',
      errors=[],                                       //message is local constructor variable ,this.message is parent message
      stack=""
    ){
       super(message);                      //super is used to call parent class and message got override eventually-- this.message=message
       this.statusCode=statusCode;
       this.data=null;
       this.error=errors;
       this.success=false;

      if(stack){
        this.stack=stack
      }else{
        Error.captureStackTrace(this, this.constructor)
      }
    }
}


export default ApiError;