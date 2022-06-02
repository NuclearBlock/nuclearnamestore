import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Container } from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';

const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
    },
}));
  
export default function Header(props) {

    const classes = useStyles();

    const minimizeStr = (str, start = 8, end = 8) => {
        return str.slice(0, start) + "..." + str.slice(-end)
    }
  
    return (

        <header>
            
            <AppBar position="static">
                <Container maxWidth="md">
                    <Toolbar>

                        <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
                            <MenuIcon />
                        </IconButton>

                        <Typography variant="h6" className={classes.title}>
                            Nuclear Name Store
                        </Typography>

                        {props.walletInfo != "undefined"
                            ?
                            <Button 
                                color="inherit" 
                                onClick={props.handleConnectWallet}
                            >
                                Connect Wallet
                            </Button>
                            :
                            <Button color="inherit" >
                                {minimizeStr(String(props.walletInfo))}
                            </Button>
                        }    

                    </Toolbar>
                </Container>
            </AppBar> 

      </header>
    );
}
  
  