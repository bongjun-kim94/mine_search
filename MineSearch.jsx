import React, { useEffect, useReducer, createContext, useMemo } from 'react';
import Table from './Table';
import Form from './Form';

export const CODE = {
    MINE: -7,
    NORMAL: -1,
    QUESTION: -2,
    FLAG: -3,
    QUESTION_MINE: -4,
    FLAG_MINE: -5,
    CLICKED_MINE: -6,
    OPENED: 0, // 0 이상이면 다 OPENED
};

// 다른 파일에서 쓸 수 있게 export
export const TableContext = createContext({
    tableData: [],
    halted: true,
    dispatch: () => {},
});

const initialState = {
    tableData: [],
    timer: 0,
    result: '',
    halted: true,
};

// tableData에 지뢰를 심는 함수
const plantMine = (row, cell, mine) => {
    console.log(row, cell, mine);
    // 0~99까지의 숫자
    const candidate = Array(row * cell).fill().map((arr, i) => {
        return i;
    });
    const shuffle = [];
    while (candidate.length > row * cell - mine) {
        const chosen = candidate.splice(Math.floor(Math.random() * candidate.length), 1)[0];
        shuffle.push(chosen);
    }
    const data = [];
    // 2차원배열 생성
    for (let i = 0; i < row; i++) {
        const rowData = [];
        data.push(rowData);
        for (let j = 0; j < cell; j++) {
            rowData.push(CODE.NORMAL);
        }
    }
    // 몇 , 몇 , 인지 계산 하는 코드
    for (let k = 0; k < shuffle.length; k++) {
        const ver = Math.floor(shuffle[k] / cell);
        const hor = shuffle[k] % cell;
        data[ver][hor] = CODE.MINE;
    }
    return data;
};

export const START_GAME = 'START_GAME';
export const OPEN_CELL = 'OPEN_CELL';

const reducer = (state, action) => {
    switch (action.type) {
        case START_GAME:
            return {
                ...state,
                tableData: plantMine(action.row, action.cell, action.mine),
                halted: false,
            };
        case OPEN_CELL:
            const tableData = [...state.tableData];
            tableData[action.row] = [...state.tableData[action.row]];
            tableData[action.row][action.cell] = CODE.OPENED;
            let around = [];
            // 내 윗줄이 있으면 그 윗줄 세 칸을 검사대상에 넣어줌
            if (tableData[action.row - 1]) {
                around = around.concat(
                    tableData[action.row - 1][action.cell - 1],
                    tableData[action.row - 1][action.cell],
                    tableData[action.row - 1][action.cell + 1],
                );
            }
            // 내 왼쪽칸, 오른쪽칸
            around = around.concat(
                tableData[action.row][action.cell - 1],
                tableData[action.row][action.cell + 1],
            );
            // 내 아랫줄이 있으면
            if (tableData[action.row + 1]) {
                around = around.concat(
                    tableData[action.row + 1][action.cell - 1],
                    tableData[action.row + 1][action.cell],
                    tableData[action.row + 1][action.cell + 1],
                );
            }
            // 주변 8칸 중에 지뢰인 칸을 세는 함수
            const count = around.filter((v) => [CODE.MINE, CODE.FLAG_MINE, CODE.QUESTION_MINE].includes(v)).length;
            tableData[action.row][action.cell] = count;
            return {
                ...state,
                tableData,
            };
        case CLICK_MINE: {
            const tableData = [...state.tableData];
            tableData[action.row] = [...state.tableData[action.row]];
            tableData[action.row][action.cell] = CODE.CLICKED_MINE;
            return {
                ...state,
                tableData,
                halted: true,
            };
        }
        case FLAG_CELL: {
            const tableData = [...state.tableData];
            tableData[action.row] = [...state.tableData[action.row]];
            // 지뢰가 있는 칸이면
            if (tableData[action.row][action.cell] == CODE.MINE){
                tableData[action.row][action.cell] = CODE.FLAG_MINE;
            } else {
                tableData[action.row][action.cell] = CODE.FLAG;
            }
            return {
                ...state,
                tableData, 
            };
        }
        case QUESTION_CELL: {
            const tableData = [...state.tableData];
            tableData[action.row] = [...state.tableData[action.row]];
            // 지뢰가 있는 칸이면
            if (tableData[action.row][action.cell] == CODE.FLAG_MINE){
                tableData[action.row][action.cell] = CODE.QUESTION_MINE;
            } else {
                tableData[action.row][action.cell] = CODE.QUESTION;
            }
            return {
                ...state,
                tableData, 
            };
        }
        case NORMALIZE_CELL: {
            const tableData = [...state.tableData];
            tableData[action.row] = [...state.tableData[action.row]];
            // 지뢰가 있는 칸이면
            if (tableData[action.row][action.cell] == CODE.QUESTION_MINE){
                tableData[action.row][action.cell] = CODE.MINE;
            } else {
                tableData[action.row][action.cell] = CODE.NORMAL;
            }
            return {
                ...state,
                tableData, 
            };
        }
        default:
            return state;
    }
};

const MineSearch = () => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { tableData, halted, timer, result} = state;
    // state.tableData가 변경될 때 갱신
    const value = useMemo(() => ({ tableData: tableData, halted: halted, dispatch }), [tableData, halted]);

    return (
        <>
            <TableContext.Provider value={value}>
                <Form />
                <div>{timer}</div>
                <Table />
                <div>{result}</div>
            </TableContext.Provider>
        </>
    )
};

export default MineSearch;