/**
 * controllers/medicineController.js — Pharmacy inventory management & stock control
 */
const Medicine = require('../models/Medicine');

// GET /api/medicines — Searchable catalog with stock filtering
exports.getAllMedicines = async (req, res) => {
  try {
    const { search, category, stockStatus, page = 1, limit = 20 } = req.query;
    const filter = { isActive: true };

    if (search) {
      filter.$or = [
        { name:         { $regex: search, $options: 'i' } },
        { genericName:  { $regex: search, $options: 'i' } },
        { category:     { $regex: search, $options: 'i' } },
        { manufacturer: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) filter.category = category;

    if (stockStatus === 'low') {
      filter.$expr = { $lte: ['$stockQuantity', '$reorderLevel'] };
    } else if (stockStatus === 'out') {
      filter.stockQuantity = 0;
    } else if (stockStatus === 'in') {
      filter.$expr = { $gt: ['$stockQuantity', '$reorderLevel'] };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [medicines, total] = await Promise.all([
      Medicine.find(filter)
        .populate('addedBy', 'name role')
        .skip(skip)
        .limit(Number(limit))
        .sort({ name: 1 }),
      Medicine.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data:    medicines,
      total,
      page:    Number(page),
      pages:   Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/medicines/:id
exports.getMedicineById = async (req, res) => {
  try {
    const med = await Medicine.findById(req.params.id).populate('addedBy', 'name role');
    if (!med) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }
    res.json({ success: true, data: med });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/medicines — Add new medicine to inventory
exports.createMedicine = async (req, res) => {
  try {
    const med = await Medicine.create({
      ...req.body,
      addedBy: req.user._id,
    });
    res.status(201).json({
      success: true,
      data:    med,
      message: `Medicine '${med.name}' added to inventory`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/medicines/:id — Update price, details, reorder levels
exports.updateMedicine = async (req, res) => {
  try {
    const med = await Medicine.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!med) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }
    res.json({ success: true, data: med, message: 'Medicine record updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/medicines/:id/restock — Restock inventory batch
exports.restockMedicine = async (req, res) => {
  try {
    const { quantity, batchNumber, expiryDate } = req.body;
    if (!quantity || Number(quantity) <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity to add must be greater than zero' });
    }

    const med = await Medicine.findById(req.params.id);
    if (!med) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }

    med.stockQuantity += Number(quantity);
    if (batchNumber) med.batchNumber = batchNumber;
    if (expiryDate)  med.expiryDate  = new Date(expiryDate);
    await med.save();

    res.json({
      success: true,
      data:    med,
      message: `Restocked ${quantity} units of ${med.name}. Current stock: ${med.stockQuantity}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/medicines/:id — Soft-delete
exports.deleteMedicine = async (req, res) => {
  try {
    const med = await Medicine.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!med) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }
    res.json({ success: true, message: `Medicine '${med.name}' deactivated` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/medicines/low-stock — Critical low stock alert list
exports.getLowStockMedicines = async (req, res) => {
  try {
    const meds = await Medicine.find({
      isActive: true,
      $expr: { $lte: ['$stockQuantity', '$reorderLevel'] },
    }).sort({ stockQuantity: 1 });

    res.json({ success: true, data: meds, total: meds.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
