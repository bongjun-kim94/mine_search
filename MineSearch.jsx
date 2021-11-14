import React, { useReducer, createContext } from 'react';
import Table from './Table';
import Form from './Form';

const TableContext = createContext({

});

const initialState= {
    tableData: [],
    timer: 0,
    result: '',
};

const reducer = (state, action) => {
    switch (action.type) {
        default:
            return state;
    }
};

const MineSearch = () => {
    const [state, dispatch] = useReducer(reducer, initialState);

    return (
        <>
            <TableContext.Provider value={{ tableData: state.tableData, dispatch }}>
                <Form />
                <div>{state.timer}</div>
                <Table />
                <div>{result}</div>
            </TableContext.Provider>
        </>
    )
};

export default MineSearch;