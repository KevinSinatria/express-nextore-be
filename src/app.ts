import { PORT } from "./config/env";
import app from "./server";

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
