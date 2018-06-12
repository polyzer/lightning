class MobileCodeController {
    constructor(onButtonClick){
        this.onButtonClick = onButtonClick;

        this.CodeViewBlock = document.getElementById("code-enter-window");
        this.CodeInput = document.getElementById("code-input");
        this.CodeSendButton = document.getElementById("send-code-button");
        this.CodeSendButton.addEventListener("click", this.onSendButtonClick.bind(this));
    }

    showCodeViewWindow()
    {
        this.CodeViewBlock.style.visibility = "visible";
    }

    hideCodeViewWindow()
    {
        this.CodeViewBlock.style.visibility = "hidden";
    }
    
    onSendButtonClick()
    {
        let code = this.CodeInput.value;
        this.onButtonClick(code);
    }

    get Code()
    {
        return this.code;
    }

    set Code(code)
    {
        this.code = code;
    }


};