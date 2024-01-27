import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { toast } from "@/components/ui/use-toast"
import { Button } from '@/components/ui/button';

// A component that render a list of Example and let the user add them to the database
export function Examples(props: { onExampleLoaded: (graph: string) => void }) {

    const [examples, setExamples] = useState<string[]>([]);

    // Fetch at build time
    useEffect(() => {
        fetch('/api/examples', {
            cache: 'force-cache',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then((result) => {
                if (result.status < 300) {
                    return result.json()
                }
                return { result: [] }
            }).then((result) => {
                setExamples(result.result.examples ?? [])
            })
    }, [])

    async function addSampleDatabase(sample: string) {

        let result = await fetch('/api/examples', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: sample })
        })
        if (result.status >= 300) {
            toast({
                title: "Error",
                description: result.text(),
            })
            return
        }
        props.onExampleLoaded(sample)
        toast({
            title: "Example loaded",
            description: `The ${sample} example was loaded successfully`,
        })
    }

    let samples_list = examples.map((sample) => {
        return (
            <Button className="p-8" key={sample} onClick={ev => addSampleDatabase(sample)}>
                {sample}
            </Button>
        )
    })

    return (
        <>
            {samples_list.length > 0 &&
                <div className='flex flex-wrap space-x-2'>
                    {samples_list}
                </div>
            }
        </>
    )
}
