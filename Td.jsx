import React, { useContext, useCallback } from 'react';
import { CODE, OPEN_CELL, TableContext } from './MineSearch';

const getTdStyle = (code) => {
    switch (code) {
        case CODE.NORMAL:
        case CODE.MINE:
            return {
                background: '#444',
            };
        case CODE.OPENED:
            return {
                background: 'white',
            };
        default:
            return {
                background: 'white',
            }
    }
};

const getTdText = (code) => {
    switch (code) {
        case CODE.NORMAL:
            return '';
        case CODE.MINE:
            return 'X';
        default:
            return '';
    } 
};

const Td = ({ rowIndex, cellIndex }) => {
    const { tableData, dispatch } = useContext(TableContext);
    const onClickTd = useCallback(() => {
        dispatch({ type: OPEN_CELL, row: rowIndex, cell: cellIndex });
    }, []);
    
    return(
        <>
            <td 
                style={getTdStyle(tableData[rowIndex][cellIndex])}
                onClick={onClickTd}
            >
                {getTdText(tableData[rowIndex][cellIndex])}
            </td>
        </>
    );
};

export default Td;