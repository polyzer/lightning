class CodeController {
    constructor(){
        this.code = "";

        this.alphabet = "abcdefghijklmnopqrstuvwxyz";
        this.ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        this.numbers = "0123456789";

        this.CodeViewBlock = document.getElementById("code-show-block");

        this.generateCode();
    }
    /**
     * 
     * @param {Number} len Length of the generated string
     * @param {String} dict String of 
     */
    generateRandomString(len, dict)
    {
        let text = [];
        
        if(len){
            for(let i=0; i<len; i++)
                text.push(dict.charAt(Math.floor(Math.random() * dict.length)));
        }
        text = text.join("");
        return text;
    }

    showCodeViewWindow(){
        this.CodeViewBlock.style.visibility = "visible";
    }

    hideCodeViewWindow(){
        this.CodeViewBlock.style.visibility = "hidden";
    }
    
    get Code(){
        return this.code;
    }

    set Code(code){
        this.code = code;
    }

    isRight(code){
        if(code === this.code)
            return true;
    }

    generateCode(){
        this.Code = this.generateRandomString(4, this.numbers);
        document.getElementById("code-text").innerText = this.Code;
    }

};