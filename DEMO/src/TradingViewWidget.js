import React, { useEffect } from 'react';

const TradingViewWidget = ({ symbol }) => {
    useEffect(() => {
        // TradingView Widget script'ini yükleyin
        const script = document.createElement('script');
        script.src = "https://s3.tradingview.com/tv.js";
        script.async = true;
        document.body.appendChild(script);

        // Widget'ı kurun
        script.onload = () => {
            new window.TradingView.widget({
                autosize: true,
                symbol: symbol,
                interval: "D",
                timezone: "Etc/UTC",
                theme: "light",
                style: "1",
                locale: "en",
                toolbar_bg: "#f1f3f6",
                enable_publishing: false,
                allow_symbol_change: true,
                container_id: "tradingview_widget"
            });
        };

        return () => {
            document.body.removeChild(script);
        };
    }, [symbol]);

    return <div id="tradingview_widget" style={{ position: "relative", height: "500px" }} />;
};

export default TradingViewWidget;
