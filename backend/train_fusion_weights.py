#!/usr/bin/env python
"""
Train optimal fusion weights using historical data or synthetic examples.
This finds the best w1 (retinal) and w2 (lifestyle) weights where w1 + w2 = 1.
"""

import numpy as np
import json
from pathlib import Path
import sys
sys.path.append(str(Path(__file__).parent))

from models.fusion.weight_optimizer import FusionWeightOptimizer


def generate_training_data(n_samples=500):
    """
    Generate synthetic training data for weight optimization.
    In practice, you'd use real labeled data.
    """
    np.random.seed(42)

    # Simulate that retinal is generally more accurate (lower noise)
    # but lifestyle captures different aspects

    y_true = np.random.binomial(1, 0.35, n_samples).astype(float)  # 35% positive rate

    # Retinal predictions: More accurate, less noise
    retinal_noise = np.random.normal(0, 0.15, n_samples)
    retinal_preds = y_true + retinal_noise
    # Add some systematic bias for cases retinal might miss
    mask_retinal_miss = np.random.random(n_samples) < 0.1  # 10% cases retinal misses
    retinal_preds[mask_retinal_miss] = 1 - y_true[mask_retinal_miss]

    # Lifestyle predictions: Slightly less accurate, more noise
    lifestyle_noise = np.random.normal(0, 0.25, n_samples)
    lifestyle_preds = y_true + lifestyle_noise
    # Lifestyle is good at catching behavioral risk factors
    mask_lifestyle_good = np.random.random(n_samples) < 0.15  # 15% cases lifestyle excels
    lifestyle_preds[mask_lifestyle_good] = y_true[mask_lifestyle_good] + np.random.normal(0, 0.1, np.sum(mask_lifestyle_good))

    # Clip to [0, 1] range
    retinal_preds = np.clip(retinal_preds, 0, 1)
    lifestyle_preds = np.clip(lifestyle_preds, 0, 1)

    return y_true, retinal_preds, lifestyle_preds


def main():
    print("\n" + "="*60)
    print("TRAINING OPTIMAL FUSION WEIGHTS")
    print("="*60)

    # Generate or load training data
    print("\n1. Generating training data...")
    y_true, retinal_preds, lifestyle_preds = generate_training_data(n_samples=1000)

    print(f"   • Samples: {len(y_true)}")
    print(f"   • Positive rate: {np.mean(y_true):.2%}")
    print(f"   • Retinal accuracy: {1 - np.mean(np.abs(retinal_preds - y_true)):.2%}")
    print(f"   • Lifestyle accuracy: {1 - np.mean(np.abs(lifestyle_preds - y_true)):.2%}")

    # Initialize optimizer with different starting points
    print("\n2. Training with gradient descent...")
    optimizer = FusionWeightOptimizer(
        initial_w1=0.5,  # Start with equal weights
        initial_w2=0.5,
        learning_rate=0.01
    )

    # Train
    result = optimizer.train_batch(
        y_true[:800],  # Use 80% for training
        retinal_preds[:800],
        lifestyle_preds[:800],
        epochs=200
    )

    print(f"\n   ✓ Training complete!")
    print(f"   • Optimal weights: retinal={result['best_weights'][0]:.3f}, "
          f"lifestyle={result['best_weights'][1]:.3f}")
    print(f"   • Training loss: {result['best_loss']:.4f}")

    # Validate on test set
    print("\n3. Validating on test set...")
    test_loss = optimizer.compute_loss(
        y_true[800:],  # Use 20% for testing
        retinal_preds[800:],
        lifestyle_preds[800:],
        result['best_weights'][0],
        result['best_weights'][1]
    )
    print(f"   • Test loss: {test_loss:.4f}")

    # Try scipy optimization for comparison
    print("\n4. Comparing with scipy optimization...")
    optimizer2 = FusionWeightOptimizer()
    scipy_result = optimizer2.optimize_with_scipy(
        y_true[:800],
        retinal_preds[:800],
        lifestyle_preds[:800]
    )

    print(f"   • Scipy optimal weights: retinal={scipy_result['optimal_w1']:.3f}, "
          f"lifestyle={scipy_result['optimal_w2']:.3f}")
    print(f"   • Scipy loss: {scipy_result['optimal_loss']:.4f}")

    # Cross-validation for robust weights
    print("\n5. Cross-validation for robust weights...")
    cv_splits = []
    for i in range(5):
        start_idx = i * 200
        end_idx = start_idx + 200
        cv_splits.append({
            'y_true': y_true[start_idx:end_idx],
            'retinal_preds': retinal_preds[start_idx:end_idx],
            'lifestyle_preds': lifestyle_preds[start_idx:end_idx]
        })

    cv_result = optimizer.cross_validate_weights(cv_splits, method='scipy')
    print(f"   • CV average weights: retinal={cv_result['average_weights'][0]:.3f}, "
          f"lifestyle={cv_result['average_weights'][1]:.3f}")
    print(f"   • Standard deviation: retinal=±{cv_result['std_w1']:.3f}, "
          f"lifestyle=±{cv_result['std_w2']:.3f}")

    # Save the best weights
    print("\n6. Saving optimal weights...")

    # Use cross-validation average as most robust
    final_w1, final_w2 = cv_result['average_weights']

    # Save weights
    weights_data = {
        'retinal_weight': float(final_w1),
        'lifestyle_weight': float(final_w2),
        'best_loss': float(cv_result['average_loss']),
        'method': 'cross_validated_scipy',
        'constraint': 'w1 + w2 = 1',
        'validation': {
            'cv_folds': 5,
            'std_w1': float(cv_result['std_w1']),
            'std_w2': float(cv_result['std_w2']),
            'training_samples': 1000
        },
        'performance': {
            'retinal_standalone_accuracy': float(1 - np.mean(np.abs(retinal_preds - y_true))),
            'lifestyle_standalone_accuracy': float(1 - np.mean(np.abs(lifestyle_preds - y_true))),
            'fused_accuracy_estimate': float(1 - cv_result['average_loss'])
        }
    }

    output_path = Path(__file__).parent / 'models' / 'fusion' / 'optimal_weights.json'
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with open(output_path, 'w') as f:
        json.dump(weights_data, f, indent=2)

    print(f"   ✓ Weights saved to {output_path}")

    # Summary
    print("\n" + "="*60)
    print("TRAINING COMPLETE!")
    print("="*60)
    print(f"\n🎯 OPTIMAL FUSION WEIGHTS:")
    print(f"   • Retinal (w1): {final_w1:.3f} ({final_w1*100:.1f}%)")
    print(f"   • Lifestyle (w2): {final_w2:.3f} ({final_w2*100:.1f}%)")
    print(f"   • Constraint satisfied: w1 + w2 = {final_w1 + final_w2:.3f} ≈ 1.0")
    print(f"\n📊 EXPECTED PERFORMANCE:")
    print(f"   • Retinal only: {weights_data['performance']['retinal_standalone_accuracy']:.2%}")
    print(f"   • Lifestyle only: {weights_data['performance']['lifestyle_standalone_accuracy']:.2%}")
    print(f"   • Fused (optimal): {weights_data['performance']['fused_accuracy_estimate']:.2%}")
    print("\n✨ The fusion system will now use these optimized weights!")
    print("="*60)


if __name__ == "__main__":
    main()