const path = require('path');
const fs = require('fs');

module.exports =
    class MathsController extends require('./Controller') {

        constructor(HttpContext) {
            super(HttpContext);
        }
        get() {
            const xyOperationParametersNumber = 3;
            const nOperationParametersNumber = 2;
            const xyOperators = '+-*/%';
            const nOperators = '!pnp';
            //const operators = xyOperators + nOperators;

            let params = this.HttpContext.path.params;
            if (this.HttpContext.path.queryString == '?') {
                this.sendHelpPage();
            }
            else if (!params.op) {
                this.sendError(`op is missing`);
            }
            else {
                // TODO mettre en fonction
                if (params.op == " ")
                    params.op = "+"

                // Opérations avec x et y
                if (xyOperators.includes(params.op)) {
                    if (this.validateLength(params, xyOperationParametersNumber)
                        && this.validateNumber(params.x, `x`)
                        && this.validateNumber(params.y, `y`)) {
                        // https://www.freecodecamp.org/news/how-to-convert-a-string-to-a-number-in-javascript/#:~:text=How%20to%20convert%20a%20string%20to%20a%20number%20in%20JavaScript%20using%20the%20unary%20plus%20operator%20(%2B)
                        // +string pour convertir en number 
                        let x = +params.x;
                        let y = +params.y;

                        let result;
                        switch (params.op) {
                            case "+":
                                result = x + y;
                                this.sendResult(result);
                                break;
                            case "-":
                                result = x - y;
                                this.sendResult(result);
                                break;
                            case "*":
                                result = x * y;
                                this.sendResult(result);
                                break;
                            case "/":
                                // division par 0: infinity
                                // 0 diviser par 0 NaN
                                result = x / y;
                                this.sendResult(result);
                                break;
                            case "%":
                                result = x % y;
                                this.sendResult(result);
                                break;
                        }
                    }

                }
                // Opérations avec n
                else if (nOperators.includes(params.op)) {
                    if (this.validateLength(params, nOperationParametersNumber)
                        && this.validateNumber(params.n, 'n')) {
                        if (params.n < 0) {
                            this.sendError(`${params.n} is not an integer`);
                        }
                        else {
                            let n = +params.n;

                            let result;
                            switch (params.op) {
                                case "!":
                                    result = this.factorial(n);
                                    this.sendResult(result);
                                    break;
                                case "p":
                                    result = this.isPrime(n);
                                    this.sendResult(result);
                                    break;
                                case "np":
                                    result = this.findPrime(n);
                                    this.sendResult(result);
                                    break;
                            }
                        }

                    }
                }
                else {
                    this.sendError(`${params.op} is an invalid op`);
                }
            }

        }

        sendError(errorMessage) {
            let responseObj = this.createResponseObject({ error: errorMessage });
            this.HttpContext.response.JSON(responseObj);
        }
        createResponseObject(objectToAdd) {
            return { ...this.HttpContext.path.params, ...objectToAdd };
        }

        sendResult(result) {
            if(result == Infinity) result = "Infinity";
            if(isNaN(result)) result = "NaN";

            let responseObj = this.createResponseObject({ value: result });
            this.HttpContext.response.JSON(responseObj);
        }
        sendMissingError(objectName) {
            this.sendError(`${objectName} is missing`);
        }
        sendNaNError(objectName) {
            this.sendError(`${objectName} is not a number`);
        }
        sendHelpPage() {
            let helpPagePath = path.join(process.cwd(), "wwwroot/helpPages/MathsServiceHelp.html");
            let content = fs.readFileSync(helpPagePath);
            this.HttpContext.response.HTML(content)
        }
        validateNumber(number, name) {
            let succes = true;
            if (!number) {
                this.sendMissingError(name);
                succes = false;
            }
            else if (isNaN(number)) {
                this.sendNaNError(name);
                succes = false;
            }

            return succes;
        }
        validateLength(object, maxLength) {
            if (Object.keys(object).length > maxLength) {
                this.sendError(`There is too many parameters. Only ${maxLength} parameters are needed`);
                return false;
            }
            return true;
        }


        // TODO mettre dans un autre fichier?
        factorial(n) {
            if (n === 0 || n === 1) {
                return 1;
            }
            return n * this.factorial(n - 1);
        }
        isPrime(value) {
            for (var i = 2; i < value; i++) {
                if (value % i === 0) {
                    return false;
                }
            }
            return value > 1;
        }
        findPrime(n) {
            let primeNumer = 0;
            for (let i = 0; i < n; i++) {
                primeNumer++;
                while (!this.isPrime(primeNumer)) {
                    primeNumer++;
                }
            }
            return primeNumer;
        }
    }
