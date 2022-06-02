import React, { useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';

import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';

import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { calculateFee, parseCoins, GasPrice } from "@cosmjs/stargate";

import Header from '../components/Header'
import Footer from '../components/Footer'
 
const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

let contractAddress = "archway19gs6sgvpsgdxuf47vggjj2uvddd5hra0mclrxsfe7kxku50n8pgsydetta";
let accounts, userAddress, CosmWasmClient, queryHandler, gasPrice;

const ChainInfo = {  
    chainId: "torii-1",
    chainName: "Torii Testnet",
    rpc: "https://rpc.torii-1.archway.tech" ,
    rest: "https://api.torii-1.archway.tech",
    stakeCurrency: {coinDenom: "TORII",coinMinimalDenom: "utorii",coinDecimals: 6},
    bip44: {coinType: 118},
    bech32Config: {bech32PrefixAccAddr: "archway",bech32PrefixAccPub: "archwaypub",bech32PrefixValAddr: "archwayvaloper",bech32PrefixValPub: "archwayvaloperpub",bech32PrefixConsAddr: "archwayvalcons",bech32PrefixConsPub: "archwayvalconspub"  },
    currencies: [{coinDenom: "TORII",coinMinimalDenom: "utorii",coinDecimals: 6}],
    feeCurrencies: [{coinDenom: "TORII",coinMinimalDenom: "utorii",coinDecimals: 6}],
    coinType: 118,  gasPriceStep: {low: 0,average: 0.1,high: 0.2},
    features: ['cosmwasm']
};

const connectKeplrWallet = async () => {
    if (window['keplr']) {
        if (window.keplr['experimentalSuggestChain']) {
            await window.keplr.experimentalSuggestChain(ChainInfo)
            await window.keplr.enable(ChainInfo.chainId);
            const offlineSigner = await window.getOfflineSigner(ChainInfo.chainId);
            CosmWasmClient = await SigningCosmWasmClient.connectWithSigner(ChainInfo.rpc, offlineSigner);

            // This async waits for the user to authorize your dApp
            // it returns their account address only after permissions
            // to read that address are granted
            accounts = await offlineSigner.getAccounts();
        
            queryHandler = CosmWasmClient.queryClient.wasm.queryContractSmart;
            // Gas price
            gasPrice = GasPrice.fromString('0.002utorii');

            userAddress = accounts[0].address;
        
            console.log('Wallet connected', {
                offlineSigner: offlineSigner,
                CosmWasmClient: CosmWasmClient,
                accounts: accounts,
                userAddress: userAddress,
                chain: ChainInfo,
                queryHandler: queryHandler,
                gasPrice: gasPrice
            });
        } else {
        alert('Error accessing experimental features, please update Keplr');
        }
    } else {
        alert('Error accessing Keplr, please install Keplr');
    }
};

const getNameAvailibility = async (nameString) => {
    // Your contract address
    //const contractAddress = process.env.CONTRACT_ADDRESS;

    // Query arguments
    let entrypoint = {
        resolve_record: {name: nameString}
    };

    // Do query type 'smart'
    let queryResult = await queryHandler(contractAddress, entrypoint);
    console.log('resolve_record Query', queryResult);
    return queryResult;
}

const registerName = async (nameString) => {
    // Your contract address
    //const contractAddress = process.env.CONTRACT_ADDRESS;
   
    // Query arguments
    let entrypoint = {
        register: {name: nameString}
    };

    let txFee = calculateFee(300000, gasPrice); // XXX TODO: Fix gas estimation (https://github.com/cosmos/cosmjs/issues/828)
    let amount = parseCoins('100utorii');
    
    console.log('Tx args', {
      senderAddress: userAddress, 
      contractAddress: contractAddress, 
      msg: entrypoint, 
      fee: txFee,
      amount: amount
    });

    // Send Tx
    try {
        let tx = await CosmWasmClient.execute(userAddress, contractAddress, entrypoint, txFee, '', amount);
        console.log('Register Tx', tx);
        return tx;
    } catch (e) {
        console.warn('Error exceuting Register', e);
        return e;
    }
}

const transferName = async (nameString) => {
    // Your contract address
    // const ContractAddress = process.env.CONTRACT_ADDRESS;
    //const contractAddress = 'archway19gs6sgvpsgdxuf47vggjj2uvddd5hra0mclrxsfe7kxku50n8pgsydetta';
    
    // Query arguments
    let entrypoint = {
        transfer: {
            name: nameString,
            to: userAddress
        }
    };

    let txFee = calculateFee(300000, gasPrice); // XXX TODO: Fix gas estimation (https://github.com/cosmos/cosmjs/issues/828)
    let amount = parseCoins('999utorii');
    
    console.log('Tx args', {
      senderAddress: userAddress, 
      contractAddress: contractAddress, 
      msg: entrypoint, 
      fee: txFee,
      amount: amount
    });

    // Send Tx
    try {
        let tx = await CosmWasmClient.execute(userAddress, contractAddress, entrypoint, txFee, '', amount);
        console.log('Transfer Tx', tx);
        return tx;
    } catch (e) {
        console.warn('Error exceuting Transfer', e);
        return e;
    }
}

const validate = (searchString) => {
    if (/^[a-z]+$/.test(searchString)) {
        return true;
    }
    return false;
} 

function Home() {

    const [unavailable, setUnavailable] = React.useState("");
    const [searchString, setSearchString] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);

    const [open, setOpen] = React.useState(false);
    const [dialog, setDialog] = React.useState({
        title: "",
        text: "",
        buttonText: "",
        action: "",
    })

    const handleClickOpen = () => {
        setOpen(true);
    };


    const handleClose = () => {
        setOpen(false);
    };

    const handleCloseBackdrop = () => {
        setIsLoading(false);
    };

    const handleConfirm = () => {
        if (dialog.action == "register") {
            setOpen(false);
            setIsLoading(true);

            registerName(searchString)
            .then((data) => {
                if (!(data instanceof Error)) {
                    setIsLoading(false);
                    setDialog({
                        title: "Success",
                        text: `Congratulations! \n You are just registered name ${searchString}. \n Do you want to transfer it for 999 utorii ?`,
                        buttonText: "Transfer!",
                        action: "transfer"
                    });
                    setOpen(true);
                } else {
                    setIsLoading(false);
                    setDialog({
                        title: "Error",
                        text: String(data),
                        buttonText: "ok",
                        action: "error"
                    });
                    setOpen(true);
                }
            })
        } else if (dialog.action == "transfer") {
            setOpen(false);
            setIsLoading(true);

            transferName(searchString)
            .then((data) => {
                if (!(data instanceof Error)) {
                    setIsLoading(false);
                    setDialog({
                        title: "Success",
                        text: `Congratulations! \n You are just transfered name ${searchString} to your account.`,
                        buttonText: "Ok",
                        action: "complete"
                    });
                    setOpen(true);
                } else {
                    setIsLoading(false);
                    setDialog({
                        title: "Error",
                        text: String(data),
                        buttonText: "ok",
                        action: "error"
                    });
                    setOpen(true);
                }
            })
        } else if (dialog.action == "complete") {
            setOpen(false);
            setSearchString("");
        } else if (dialog.action == "error") {
            setOpen(false);
        }
    };

    const handleSearchSubmit = event => {
        event.preventDefault();
        setUnavailable("");
        if (userAddress === undefined) {
            connectKeplrWallet();
            return;
        }
        if (searchString) {
            // setIsLoading(true);
            if (validate(searchString)) {
                getNameAvailibility(searchString)
                .then((data) => {
                    // setIsLoading(false);
                    if (!data.address) {
                        console.log('Name is available for registration!')
                        setDialog({
                            title: "Success",
                            text: "This name is available for registration! \n Do you want to register it now for just 100 utorii ?",
                            buttonText: "Register!",
                            action: "register"
                        });
                        setOpen(true);
                    } else {
                        setUnavailable("Sorry, this name is unavailable.");
                    }
                });
            } else {
                setUnavailable("Only letters in lowercase allowed.");
            }
        }      
    };

    return (

        <>
        <Header handleConnectWallet={connectKeplrWallet} walletInfo={userAddress} />

        <div className="main">

            <form onSubmit={handleSearchSubmit}>
                <TextField 
                    id="checkName" 
                    name="searchString"
                    value={searchString}
                    onChange={(e) => setSearchString(e.target.value)}
                    label="Name" 
                    variant="outlined" 
                    size="small"
                />

                &nbsp;

                <Button type="submit" variant="contained" color="primary">
                    Check!
                </Button>

            </form>

            <div className="message">
                {unavailable}
            </div>

            <Dialog
                open={open}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleClose}
                aria-labelledby="alert-dialog-slide-title"
                aria-describedby="alert-dialog-slide-description"
            >
                <DialogTitle id="alert-dialog-slide-title">{Dialog.title}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-slide-description">
                        {dialog.text}
                    </DialogContentText>
                </DialogContent>
                    <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm} color="primary">
                        {dialog.buttonText}
                    </Button>
                </DialogActions>
            </Dialog>

            <Backdrop open={isLoading} onClick={handleCloseBackdrop}>
                <CircularProgress color="primary" />
            </Backdrop>

        </div>

        <Footer />

        </>

    );
}

export default Home;