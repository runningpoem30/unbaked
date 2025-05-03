const incomeRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  walletAddress: { type: String, required: true },
  incomeType: { type: String, enum: ['itr', 'non-itr'], required: true },
  incomeValue: { type: Number, required: true },
  annualIncome: { type: Number, required: true },
  lendingCap: { type: Number, required: true },
  incomeHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('IncomeRecord', incomeRecordSchema);