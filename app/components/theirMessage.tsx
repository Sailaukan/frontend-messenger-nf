const TheirMessage = ({text}: { text: string }) => {
    return (
        
        <div className="flex">
        <div className="max-w-[70%] bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg p-3 shadow-sm">
          <p>{text}</p>
        </div>
      </div>
    )
}

export default TheirMessage;