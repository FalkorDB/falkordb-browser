import { useCallback, useContext } from "react";
import QuerySettings from "./QuerySettings";
import { QuerySettingsContext } from "../components/provider";

export default function BrowserSettings() {

    const {
        saveSettings,
    } = useContext(QuerySettingsContext)

    const handleSubmit = useCallback((e?: React.FormEvent<HTMLFormElement>) => {
        e?.preventDefault()

        saveSettings()
    }, [saveSettings])

    return (
        <form onSubmit={handleSubmit} className="h-full w-full flex flex-col gap-16 overflow-y-auto px-[20%]">
            <QuerySettings handleSubmit={handleSubmit} />
        </form>
    )
}