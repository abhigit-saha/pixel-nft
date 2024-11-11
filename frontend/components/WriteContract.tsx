import { Input } from "./ui/input";
import { Button } from "./ui/button";
const WriteContract = () => {
  return (
    <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-8">
      <h3 className="text-xl font-semibold mb-4">Write to Contract</h3>
      <form className="space-y-4">
        <Input
          type="text"
          name="tokenId"
          placeholder="Enter Token ID e.g., 69420"
          className="w-full p-2 border rounded"
          required
        />
        <Button
          type="submit"
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Mint
        </Button>
      </form>
    </div>
  );
};

export default WriteContract;
