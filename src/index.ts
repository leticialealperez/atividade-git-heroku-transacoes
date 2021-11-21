import express, {NextFunction, Request, Response} from 'express'
import 'dotenv/config'

const port = process.env.PORT
const app = express();
app.use(express.json());

app.listen(port, ()=>{
    console.log(`>>> Started server on PORT: ${port}`);
});

class User {
    public id: number;
    public name: string;
    public cpf: string;
    public email: string;
    public age: number;
    public transactions: Array<Transaction> = [];

    constructor(id: number, nome: string, cpf: string, email:string, idade: number){
        this.id = id;
        this.name = nome;
        this.cpf = cpf;
        this.email = email;
        this.age = idade;
    }
}

class Transaction{
    public id: number;
    public title: string;
    public value: number;
    public type: string;

    constructor(id: number, titulo: string, valor: number, tipo: string){
        this.id = id;
        this.title = titulo;
        this.value = valor;
        this.type = tipo;
    }
}

let users: Array<User> = [];
let idUser: number = 0;
let idTransaction: number = 0;



//CREATE USER...
app.post("/user", (req: Request, res: Response, next: NextFunction) =>{
    let { name, cpf, email, age } = req.body;
    
    let userFound: User | undefined = users.find(
        (user) => user.cpf == cpf
    );

    if(userFound){
        res.status(400).send("ERRO: cpf já cadastrado!");
    }else {
        const userCreate: User = new User(idUser, name, cpf, email, age);
        users.push(userCreate);
        idUser++;

        res.status(201).json(userCreate);  
    }
     
})

//READ ALL USERS...
app.get("/user", (req: Request, res: Response) =>{
    let allUsers: any = [];
    
    users.forEach(element => {
        const { transactions, ...usersfilter } = element;
        allUsers.push(usersfilter);
    });

    res.status(201).json(allUsers);
})

//READ USER...
app.get("/user/:idUser", (req: Request, res: Response, next: NextFunction) =>{
    const idFound: number = Number(req.params.idUser);

    let userFound: User | undefined = users.find(
        (user) => user.id == idFound
    );

    if(userFound){
        const { transactions, ...userFoundFilter } = userFound;
        
        res.send(userFoundFilter);
    }else {

        res.send("ERRO! Usuário não encontrado!");
    }
    
})

//UPDATE USER...
app.put("/user/:idUser", (req: Request, res: Response, next: NextFunction) =>{
    const name = String(req.body.name);
    const cpf = String(req.body.cpf);
    const email = String(req.body.email);
    const age = Number(req.body.age);
    const idFound = Number(req.params.idUser);

    let indexFound = users.findIndex((user) => user.id == idFound);

    if(indexFound > -1){
        if(name !== "undefined") users[indexFound].name = name;
        if(cpf !== "undefined") users[indexFound].cpf = cpf;
        if(email !== "undefined") users[indexFound].email = email;
        if(!isNaN(age)) users[indexFound].age = age;
        
        const { transactions, ...userFoundFilter } = users[indexFound];
        res.status(200).send(userFoundFilter);
    }else{
        res.status(400).send("Erro: Usuário não encontrado!");
    }
})


//DELETE USER...
app.delete("/user/:idUser", (req: Request, res: Response, next: NextFunction) =>{
    const idFound = Number(req.params.idUser);

    let indexFound = users.findIndex((user) => user.id == idFound);

    if(indexFound > -1){
        res.status(200).send(users.splice(indexFound, 1));
    
    }else{
        res.status(400).send("Erro: Usuário não encontrado!");
    }
})



//CREATE TRANSACTION...
app.post("/user/:idUser/transactions", (req: Request, res: Response) =>{
    let idFound = Number(req.params.idUser);
    let title = String(req.body.title);
    let value = Number(req.body.value);
    let type = String(req.body.type).toLowerCase(); 
    
    let validType: boolean = false;
    
    if(type.includes("income") || type.includes("outcome")) validType = true;

    let indexFound = users.findIndex((user) => user.id == idFound);

    if(indexFound > -1 && validType == true){
        const transactionCreate: Transaction = new Transaction (idTransaction, title, value, type);
        users[indexFound].transactions.push(transactionCreate);
        idTransaction++;

        res.status(201).json(transactionCreate);
         
    }else if(validType == false){
        res.status(400).send("Erro: Tipo de transação inválida!");
    
    }else{
        res.status(400).send("Erro: Usuário informado não existe!");
    }
             
})

//READ ALL TRANSACTIONS FOR ID USER...
app.get("/user/:idUser/transactions/", (req: Request, res: Response, next: NextFunction) =>{
    let idUserFound = Number(req.params.idUser);
    
    let indexUserFound = users.findIndex((user) => user.id == idUserFound);
    
    if(indexUserFound > -1) {
        res.status(201).send(users[indexUserFound].transactions);
        
    }else{
        res.status(400).send("ERRO: Usuário não encontrado!");
    } 
})

//READ FOR ID TRANSACTION...
app.get("/user/:idUser/transactions/:idTransaction", (req: Request, res: Response, next: NextFunction) =>{
    const idTransactionFound: number = Number(req.params.idTransaction);
    const idUserFound = Number(req.params.idUser);

    let userFound = users.find(
        (user) => user.id == idUserFound
    );
    
    if(userFound){
        let transactionFound = userFound.transactions.find(
            (transaction) => transaction.id == idTransactionFound
        );

        if(transactionFound){
            res.status(201).send(transactionFound)
        
        }else{
            res.status(400).send("ERRO: Transação não encontrada!");
        }
    }else{
        res.status(400).send("ERRO: Usuário não encontrado!");
    }
      
})

//UPDATE TRANSACTION FOR EACH USER...
app.put("/user/:idUser/transactions/:idTransaction", (req: Request, res: Response, next: NextFunction) =>{
    const idTransactionFound: number = Number(req.params.idTransaction);
    const idUserFound = Number(req.params.idUser);
    
    const title = String(req.body.title);
    const value = Number(req.body.value);
    const type = String(req.body.type).toLowerCase();
    
    let indexUserFound = users.findIndex((user) => user.id == idUserFound);
    
    if(indexUserFound > -1){
        let indexTransactionFound = users[indexUserFound].transactions.findIndex((transaction) => transaction.id == idTransactionFound);
        
        if(indexTransactionFound > -1){
            
            if(title !== "undefined") users[indexUserFound].transactions[indexTransactionFound].title = title;
            if(!isNaN(value)) users[indexUserFound].transactions[indexTransactionFound].value = value;
            if(type !== "undefined") users[indexUserFound].transactions[indexTransactionFound].type = type;

            res.status(200).send(users[indexUserFound].transactions[indexTransactionFound]);
        
        }else{
            res.status(400).send("Erro: Transação não encontrada!");
        }
    
    }else{
        res.status(400).send("Erro: Usuário não encontrado!");
    }
   
})

//DELETE TRANSACTION FOR EACH USER...
app.delete("/user/:idUser/transactions/:idTransaction", (req: Request, res: Response, next: NextFunction) =>{
    const idTransactionFound: number = Number(req.params.idTransaction);
    const idUserFound = Number(req.params.idUser);

    let indexUserFound = users.findIndex((user) => user.id == idUserFound);

    if(indexUserFound > -1){
        let indexTransactionFound = users[indexUserFound].transactions.findIndex((transaction) => transaction.id == idTransactionFound);
        
        if(indexTransactionFound > -1){
            res.status(200).send(users[indexUserFound].transactions.splice(indexTransactionFound, 1));
        
        }else{
            res.status(400).send("Erro: Transação não encontrada!");
        }
    
    }else{
        res.status(400).send("Erro: Usuário não encontrado!");
    }
    
})
