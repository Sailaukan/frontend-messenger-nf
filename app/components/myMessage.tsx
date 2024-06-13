const MyMessage = ({text}: { text: string }) => {
    return (
        <div className="flex justify-end">
            <div className="max-w-[70%] bg-blue-500 text-white rounded-lg p-3 shadow-sm">
                <p>{text}</p>
            </div>
        </div>
    )
}

export default MyMessage;