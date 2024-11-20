import React from "react";
import {StockTable} from "@/app/stock/components/stock_display";
import { title } from "@/components/primitives";

export default function StockPage() {
    return (
        <div>
            <h1 className={title()}>Stock Overview</h1>
            <StockTable/>
        </div>
    );
}